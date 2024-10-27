import { Handler } from '@interfaces';

const logout: Handler<null> = async (__req, res) => {
    res.clearCookie('token');
    return null;
};

export const logoutHandler = {
    logout
};
