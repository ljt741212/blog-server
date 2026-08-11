import { Type } from 'class-transformer';
import { Column, Entity, OneToMany } from 'typeorm';

import { CommonEntity } from '@/common/entity/common.entity';
import { Comment } from '@/modules/comment/comment.entity';
import { Post } from '@/modules/post/post.entity';

export enum UserRole {
  ADMIN = 0,
  SUPER_ADMIN = 1,
}

export enum Gender {
  FEMALE = 0,
  MALE = 1,
}

@Entity('users')
export class User extends CommonEntity {
  @Column({ type: 'varchar', length: 50, unique: true, comment: '用户名' })
  username: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '昵称' })
  nickname: string;

  @Column({ type: 'varchar', length: 100, comment: '密码' })
  password: string;

  @Column({ type: 'varchar', length: 100, unique: true, comment: '邮箱' })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: '手机号' })
  phone: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '微信号' })
  wechat: string;

  @Column({
    type: 'tinyint',
    default: UserRole.ADMIN,
    comment: '角色：0-管理员，1-超级管理员',
  })
  role: UserRole;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '头像' })
  avatar: string;

  @Column({ type: 'text', nullable: true, comment: '简介' })
  bio: string;

  @Column({
    name: 'github_account',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'GitHub账号',
  })
  githubAccount: string;

  @Column({
    type: 'tinyint',
    nullable: true,
    comment: '性别：0-女，1-男',
  })
  gender: Gender;

  @Type(() => Post)
  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @Type(() => Comment)
  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];
}
