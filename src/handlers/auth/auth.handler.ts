import { AuthResultDto } from '@dtos/out';
import { Handler } from '@interfaces';
import jwt from 'jsonwebtoken';
import { envs } from '@configs';
import { prisma } from '@repositories';
import { cookieOptions, LOGIN_FAIL, SALT_ROUNDS, USER_NOT_FOUND } from '@constants';
import { AuthInputDto } from '@dtos/in';
import { compare, hash } from 'bcrypt';

const login: Handler<AuthResultDto, { Body: AuthInputDto }> = async (req, res) => {
    const user = await prisma.user.findUnique({
        select: {
            id: true,
            username: true,
            password: true
        },
        where: { username: req.body.username }
    });
    if (!user) return res.badRequest(USER_NOT_FOUND);

    const correctPassword = await compare(req.body.password, user.password || '');
    if (!correctPassword) return res.badRequest(LOGIN_FAIL);

    const userToken = jwt.sign({ userId: user.id }, envs.JWT_SECRET);
    res.setCookie('token', userToken, cookieOptions);

    return {
        id: user.id,
        username: user.username as string
    };
};

const signup: Handler<AuthResultDto, { Body: AuthInputDto }> = async (req, res) => {
    const hashPassword = await hash(req.body.password, SALT_ROUNDS);
    const user = await prisma.user.create({
        data: {
            username: req.body.username,
            password: hashPassword
        }
    });

    const userToken = jwt.sign({ userId: user.id }, envs.JWT_SECRET);
    res.setCookie('token', userToken, cookieOptions);

    return {
        id: user.id,
        username: user.username as string
    };
};

export const authHandler = {
    login,
    signup
};
