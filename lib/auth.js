import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export function signToken(user) {
    return jwt.sign(
        {
            userId: user._id,
            email: user.email,
            role: user.role,
        },
        JWT_SECRET,
        { expiresIn: "7d" }
    );
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

export async function getAuthUser(request) {
    // Try Authorization header first
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        if (decoded) return decoded;
    }

    // Try cookie
    const cookie = request.headers.get("cookie");
    if (cookie) {
        const tokenCookie = cookie
            .split(";")
            .find((c) => c.trim().startsWith("token="));
        if (tokenCookie) {
            const token = tokenCookie.split("=")[1];
            const decoded = verifyToken(token);
            if (decoded) return decoded;
        }
    }

    return null;
}

export function requireRole(...allowedRoles) {
    return async (request) => {
        const user = await getAuthUser(request);
        if (!user) {
            return { authorized: false, status: 401, message: "Authentication required" };
        }
        if (!allowedRoles.includes(user.role)) {
            return { authorized: false, status: 403, message: "Insufficient permissions" };
        }
        return { authorized: true, user };
    };
}
