import { AuthResultDto } from '@dtos/out';
import { Handler } from '@interfaces';
import jwt from 'jsonwebtoken';
import { envs } from '@configs';
import { google } from 'googleapis';
import { prisma } from '@repositories';
import { cookieOptions } from '@constants';

export const getGoogleUserInfo = async (authorizationCode: string) => {
    try {
        const googleOAuth2Client = new google.auth.OAuth2(envs.GOOGLE_CLIENT_ID, envs.GOOGLE_CLIENT_SECRET, envs.GOOGLE_REDIRECT_URL);

        const { tokens } = await googleOAuth2Client.getToken(authorizationCode);
        googleOAuth2Client.setCredentials(tokens);

        const peopleApi = google.people({ version: 'v1', auth: googleOAuth2Client });

        const userInfo = await peopleApi.people.get({
            resourceName: 'people/me',
            personFields: 'emailAddresses,names'
        });
        const userEmail = userInfo.data.emailAddresses?.[0].value;
        const isVerifiedEmail = userInfo.data.emailAddresses?.[0].metadata?.verified || false;
        const userName = userInfo.data.names?.[0].displayName;
        return {
            userEmail,
            userName,
            isVerifiedEmail
        };
    } catch (error) {
        throw new Error(error);
    }
};

const googleOAuth: Handler<AuthResultDto, { Querystring: { code: string } }> = async (req, res) => {
    try {
        const { userEmail, userName, isVerifiedEmail } = await getGoogleUserInfo(req.query.code);

        if (!isVerifiedEmail) {
            return res.status(406).send('Email needs to be verified for authentication.');
        }

        if (userEmail && userName) {
            const { id: userId } = await prisma.user.upsert({
                where: { email: userEmail },
                update: {},
                create: {
                    email: userEmail
                },
                select: { id: true }
            });

            const userToken = jwt.sign({ userId }, envs.JWT_SECRET);
            res.setCookie('token', userToken, cookieOptions);

            return res.redirect(envs.UI_HOME_URL).send({ id: userId });
        } else {
            return res.status(400).send('User information not available.');
        }
    } catch (error) {
        console.error('Error processing user information:', error);
        res.status(500).send('Error processing user information');
    }
};

export const googleAuthHandler = {
    googleOAuth
};
