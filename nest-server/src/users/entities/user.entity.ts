import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '../../common/custom-decorators/roles';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    _id: string;

    @Column()
    fullName: string;

    @Column()
    password: string;

    @Column()
    age: number;

    @Column({ unique: true })
    email: string;

    @Column({
        type: 'enum',
        enum: Role,
        default: Role.User,
    })
    role: Role;
}