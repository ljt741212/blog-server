import fs from 'fs'
import path from 'path'

/**
 * 从 schema.sql 自动生成 TypeORM 实体文件
 */
const schemaPath = path.join(__dirname, '../database/schema.sql')
const modulesPath = path.join(__dirname, '../src/modules')

// 读取 schema.sql
const schemaContent = fs.readFileSync(schemaPath, 'utf-8')

// 解析表结构
interface TableColumn {
  name: string
  type: string
  nullable: boolean
  default?: string
  comment?: string
  isPrimary?: boolean
  isUnique?: boolean
  isEnum?: boolean
  enumValues?: string[]
}

interface TableInfo {
  name: string
  columns: TableColumn[]
  comment?: string
}

// 解析 SQL 创建表语句
function parseTable(sql: string, tableName: string): TableInfo | null {
  const tableRegex = new RegExp(
    `CREATE TABLE \\\`${tableName}\\\`\\s*\\(([\\s\\S]*?)\\)[^;]*;`,
    'i',
  )
  const match = sql.match(tableRegex)
  if (!match) return null

  const columns: TableColumn[] = []
  const columnLines = match[1].split(',').map((line) => line.trim())

  for (const line of columnLines) {
    if (line.startsWith('PRIMARY KEY') || line.startsWith('UNIQUE KEY') || line.startsWith('KEY') || line.startsWith('CONSTRAINT')) {
      // 处理主键、唯一键等约束
      if (line.includes('PRIMARY KEY')) {
        const pkMatch = line.match(/PRIMARY KEY\s*\(`(\w+)`\)/i)
        if (pkMatch) {
          const col = columns.find((c) => c.name === pkMatch[1])
          if (col) col.isPrimary = true
        }
      }
      if (line.includes('UNIQUE KEY')) {
        const ukMatch = line.match(/UNIQUE KEY[^`]*`(\w+)`/i)
        if (ukMatch) {
          const col = columns.find((c) => c.name === ukMatch[1])
          if (col) col.isUnique = true
        }
      }
      continue
    }

    const columnMatch = line.match(/^`(\w+)`\s+(\w+(?:\([^)]+\))?)\s*(.*)$/i)
    if (!columnMatch) continue

    const [, name, type, rest] = columnMatch
    const nullable = !rest.includes('NOT NULL')
    const defaultMatch = rest.match(/DEFAULT\s+([^\s]+)/i)
    const commentMatch = rest.match(/COMMENT\s+['"]([^'"]+)['"]/i)
    const enumMatch = rest.match(/enum\(['"]([^'"]+)['"]\)/i)

    const column: TableColumn = {
      name,
      type: type.toLowerCase(),
      nullable,
      comment: commentMatch ? commentMatch[1] : undefined,
    }

    if (defaultMatch) {
      column.default = defaultMatch[1]
    }

    if (enumMatch) {
      column.isEnum = true
      column.enumValues = enumMatch[1].split("','").map((v) => v.replace(/'/g, ''))
    }

    columns.push(column)
  }

  // 查找表注释
  const commentMatch = sql.match(new RegExp(`CREATE TABLE \\\`${tableName}\\\`[^;]*COMMENT=['"]([^'"]+)['"]`, 'i'))
  const tableComment = commentMatch ? commentMatch[1] : undefined

  return { name: tableName, columns, comment: tableComment }
}

// TypeORM 类型映射
function mapTypeToTypeORM(mysqlType: string): string {
  const type = mysqlType.toLowerCase()
  if (type.startsWith('varchar') || type.startsWith('char')) {
    const lengthMatch = type.match(/\((\d+)\)/)
    const length = lengthMatch ? lengthMatch[1] : '255'
    return `'varchar', length: ${length}`
  }
  if (type.startsWith('text')) return `'text'`
  if (type.startsWith('int')) return `'int'`
  if (type.startsWith('tinyint')) return `'tinyint'`
  if (type.startsWith('datetime')) return `'datetime'`
  if (type.startsWith('date')) return `'date'`
  if (type.startsWith('enum')) return `'enum'`
  return `'${type}'`
}

// 生成实体文件内容
function generateEntity(tableInfo: TableInfo): string {
  const entityName = toPascalCase(tableInfo.name.replace(/s$/, ''))
  const moduleName = tableInfo.name.replace(/_/g, '-')
  const moduleDir = path.join(modulesPath, moduleName)

  // 创建模块目录
  if (!fs.existsSync(moduleDir)) {
    fs.mkdirSync(moduleDir, { recursive: true })
  }

  const imports: string[] = []
  const decorators: string[] = []
  const columns: string[] = []
  const enums: string[] = []

  // 处理枚举类型
  const enumColumns = tableInfo.columns.filter((col) => col.isEnum)
  for (const col of enumColumns) {
    const enumName = toPascalCase(col.name)
    if (col.enumValues) {
      enums.push(`export enum ${enumName} {`)
      for (const val of col.enumValues) {
        const key = val.toUpperCase().replace(/-/g, '_')
        enums.push(`  ${key} = '${val}',`)
      }
      enums.push(`}`)
    }
  }

  // 检查是否有 created_at 和 updated_at
  const hasTimestamps = tableInfo.columns.some((c) => c.name === 'created_at' || c.name === 'updated_at')
  const extendsBase = hasTimestamps && tableInfo.columns.some((c) => c.name === 'id')

  if (extendsBase) {
    imports.push("import { CommonEntity } from '../../common/entity/common.entity'")
    imports.push("import {")
    imports.push("  Column,")
    imports.push("  Entity,")
    const hasRelations = tableInfo.columns.some((c) => c.name.includes('_id') || c.name.includes('Id'))
    if (hasRelations) {
      imports.push("  ManyToOne,")
      imports.push("  OneToMany,")
      imports.push("  ManyToMany,")
      imports.push("  JoinTable,")
    }
    imports.push("} from 'typeorm'")
  } else {
    imports.push("import {")
    imports.push("  Column,")
    imports.push("  CreateDateColumn,")
    imports.push("  Entity,")
    imports.push("  PrimaryGeneratedColumn,")
    imports.push("  UpdateDateColumn,")
    const hasRelations = tableInfo.columns.some((c) => c.name.includes('_id') || c.name.includes('Id'))
    if (hasRelations) {
      imports.push("  ManyToOne,")
      imports.push("  OneToMany,")
      imports.push("  ManyToMany,")
      imports.push("  JoinTable,")
    }
    imports.push("} from 'typeorm'")
  }

  decorators.push(`@Entity('${tableInfo.name}')`)
  if (extendsBase) {
    decorators.push(`export class ${entityName} extends CommonEntity {`)
  } else {
    decorators.push(`export class ${entityName} {`)
  }

  // 生成列
  for (const col of tableInfo.columns) {
    if (col.name === 'id' && extendsBase) continue
    if (col.name === 'created_at' && extendsBase) continue
    if (col.name === 'updated_at' && extendsBase) continue

    const decoratorParts: string[] = []
    const type = mapTypeToTypeORM(col.type)

    if (col.name === 'id') {
      columns.push('  @PrimaryGeneratedColumn()')
      columns.push('  id: number;')
      continue
    }

    if (col.name === 'created_at') {
      columns.push("  @CreateDateColumn({ name: 'created_at' })")
      columns.push('  createdAt: Date;')
      continue
    }

    if (col.name === 'updated_at') {
      columns.push("  @UpdateDateColumn({ name: 'updated_at' })")
      columns.push('  updatedAt: Date;')
      continue
    }

    decoratorParts.push(`@Column({ type: ${type}`)
    if (col.nullable) {
      decoratorParts.push('nullable: true')
    }
    if (col.isUnique) {
      decoratorParts.push('unique: true')
    }
    if (col.default !== undefined && col.default !== 'NULL') {
      if (col.isEnum) {
        const enumName = toPascalCase(col.name)
        const defaultVal = col.default.replace(/'/g, '')
        decoratorParts.push(`default: ${enumName}.${defaultVal.toUpperCase().replace(/-/g, '_')}`)
      } else if (col.default.includes('CURRENT_TIMESTAMP')) {
        // 跳过，使用 CreateDateColumn 或 UpdateDateColumn
      } else {
        decoratorParts.push(`default: ${col.default}`)
      }
    }
    if (col.comment) {
      decoratorParts.push(`comment: '${col.comment}'`)
    }
    if (col.isEnum) {
      const enumName = toPascalCase(col.name)
      decoratorParts.push(`enum: ${enumName}`)
    }
    decoratorParts.push('})')

    const propertyName = toCamelCase(col.name)
    const propertyType = col.isEnum
      ? toPascalCase(col.name)
      : col.type.includes('int')
        ? 'number'
        : col.type.includes('datetime') || col.type.includes('date')
          ? 'Date'
          : col.type.includes('tinyint')
            ? 'boolean'
            : 'string'

    columns.push(`  ${decoratorParts.join(', ')}`)
    columns.push(`  ${propertyName}: ${propertyType};`)
    if (col.comment) {
      columns.push('')
    }
  }

  const content = [
    ...imports,
    '',
    ...enums,
    enums.length > 0 ? '' : '',
    ...decorators,
    ...columns,
    '}',
  ]
    .filter((line) => line !== '')
    .join('\n')

  return content
}

function toPascalCase(str: string): string {
  return str
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

function toCamelCase(str: string): string {
  const pascal = toPascalCase(str)
  return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

// 主函数
function main() {
  // 表名列表（从 schema.sql 中提取）
  const tables = [
    'users',
    'visitors',
    'visitor_logs',
    'categories',
    'tags',
    'posts',
    'posts_tags',
    'comments',
    'announcements',
    'changelogs',
    'friend_links',
    'seo_settings',
    'icp_info',
  ]

  console.log('开始生成实体文件...')

  for (const tableName of tables) {
    const tableInfo = parseTable(schemaContent, tableName)
    if (!tableInfo) {
      console.warn(`警告: 未找到表 ${tableName}`)
      continue
    }

    const entityContent = generateEntity(tableInfo)
    const moduleName = tableName.replace(/_/g, '-')
    const entityFileName = `${toCamelCase(tableName.replace(/s$/, ''))}.entity.ts`
    const entityPath = path.join(modulesPath, moduleName, entityFileName)

    fs.writeFileSync(entityPath, entityContent, 'utf-8')
    console.log(`✓ 生成实体文件: ${entityPath}`)
  }

  console.log('实体文件生成完成!')
}

main()

