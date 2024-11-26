import { envs } from '@configs';
import { INVALID_TOKEN, MUST_LOGIN_FIRST } from '@constants';
import { FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';

export async function verifyToken(req: FastifyRequest, res: FastifyReply) {
    // Get the Authorization header
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.unauthorized(MUST_LOGIN_FIRST);
    }

    // Extract the token from the header
    const token = authHeader.slice(7).trim();

    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const decodedPayload: any = jwt.verify(token, envs.JWT_SECRET);
        req.userId = decodedPayload['userId'];
        return;
    } catch (err) {
        req.log.info(err);
        return res.forbidden(INVALID_TOKEN);
    }
}
