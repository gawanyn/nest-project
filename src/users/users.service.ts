import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import * as bcrypt from 'bcrypt';
import { count } from "console";

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {}

    async create(createUserDto: CreateUserDto): Promise<User> {
        this.logger.log(`Creating user with email: ${createUserDto.email}`);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

        const newUser = this.usersRepository.create({
            ...createUserDto,
            password: hashedPassword,
        });
        return this.usersRepository.save(newUser);
    }

    async findAll(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        const [users, total] = await this.usersRepository.findAndCount({
            skip: skip,
            take: limit,
        });

        return {
            data: users,
            count: total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(id: number) {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) {
            this.logger.warn(`User with ID ${id} not found`);
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    async update(id: number, updateUserDto: UpdateUserDto) {
        this.logger.log(`Updating user with ID: ${id}`);

        if (updateUserDto.password) {
            const salt = await bcrypt.genSalt(10);
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
        }

        await this.findOne(id);

        await this.usersRepository.update(id, updateUserDto);
        return this.findOne(id);
    }

    async remove(id: number) {
        this.logger.log(`Removing user with ID: ${id}`);
        const user = await this.findOne(id);
        return this.usersRepository.remove(user);
    }
}