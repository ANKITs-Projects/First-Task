
const refreshAuthCookie = (req, res, next) => { 
    if (req.token) { 
        res.cookie('authToken', req.token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict', 
            maxAge: 5 * 60 * 60 * 1000, 
        }); 
    } 
    next(); 
}; 