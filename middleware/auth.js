import debug from 'debug';
import crypto from 'crypto';
import { connect, newId } from '../database.js';

const debugAuth = debug('app:Auth');

export const authenticateToken = async (req, res, next) => {
    try {
        const sessionId = req.cookies?.sessionId;

        if (!sessionId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const db = await connect();

        const session = await db.collection('sessions').findOne({
            sessionId: sessionId,
            expiresAt: { $gt: new Date() }
        });

        if (!session) {
            return res.status(401).json({ error: 'Invalid or expired session' });
        }

        const user = await db.collection('users').findOne({ _id: newId(session.userId) });

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        let permissions = {};
        if (user.role && user.role.length > 0) {
            const userRoles = Array.isArray(user.role) ? user.role : [user.role];
            const roles = await db.collection('roles').find({
                name: { $in: userRoles }
            }).toArray();

            roles.forEach(role => {
                if (role.permissions) {
                    Object.assign(permissions, role.permissions);
                }
            });
        }

        req.auth = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            permissions: permissions
        };

        await updateSession(sessionId);

        debugAuth(`User ${user._id} authenticated successfully with permissions: ${Object.keys(permissions).join(', ')}`);
        next();
    } catch (err) {
        debugAuth('Authentication failed:', err.message);
        return res.status(401).json({ error: 'Authentication failed' });
    }
};

export const createSession = async (user) => {
    try {
        console.log('[CREATE-SESSION] Starting, user object:', { hasId: !!user?._id, hasEmail: !!user?.email });
        
        if (!user || !user._id) {
            console.error('[CREATE-SESSION] Invalid user object:', user);
            throw new Error('Invalid user object: missing _id');
        }

        console.log('[CREATE-SESSION] Connecting to database...');
        const db = await connect();
        console.log('[CREATE-SESSION] Database connected');

        const sessionId = crypto.randomBytes(32).toString('hex');

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        // Ensure _id is converted to string safely
        const userId = user._id.toString ? user._id.toString() : String(user._id);

        const session = {
            sessionId: sessionId,
            userId: userId,
            email: user.email || '',
            role: user.role || [],
            createdAt: new Date(),
            expiresAt: expiresAt,
            lastAccessedAt: new Date()
        };

        console.log('[CREATE-SESSION] Inserting session into database...');
        await db.collection('sessions').insertOne(session);
        console.log('[CREATE-SESSION] Session inserted successfully for user:', userId);
        debugAuth(`Session created for user: ${userId}`);

        return sessionId;
    } catch (err) {
        console.error('[CREATE-SESSION] Error:', err);
        console.error('[CREATE-SESSION] Error type:', err?.constructor?.name);
        console.error('[CREATE-SESSION] Error message:', err?.message);
        console.error('[CREATE-SESSION] Error stack:', err?.stack);
        debugAuth('Error in createSession:', err);
        throw err;
    }
};

export const updateSession = async (sessionId) => {
    const db = await connect();
    await db.collection('sessions').updateOne(
        { sessionId: sessionId },
        { $set: { lastAccessedAt: new Date() } }
    );
};

export const deleteSession = async (sessionId) => {
    const db = await connect();
    await db.collection('sessions').deleteOne({ sessionId: sessionId });
};

export const createEditRecord = async (req, collection, operation, target, update = null) => {
    try {
        const db = await connect();
        const editRecord = {
            timestamp: new Date(),
            col: collection,
            op: operation,
            target: target,
            update: update,
            auth: req.auth
        };

        await db.collection('edits').insertOne(editRecord);
        debugAuth(`Edit record created for ${operation} on ${collection}`);
    } catch (err) {
        debugAuth('Failed to create edit record:', err.message);
    }
};

export const isLoggedIn = (req, res, next) => {
    if (!req.auth || !req.auth.userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
};

export const hasAnyRole = async (req, res, next) => {
    try {
        if (!req.auth || !req.auth.userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const db = await connect();
        const user = await db.collection('users').findOne({ _id: newId(req.auth.userId) });

        if (!user || !user.role || user.role.length === 0) {
            return res.status(403).json({ error: 'Role required' });
        }

        next();
    } catch (err) {
        debugAuth('Error checking role:', err.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const hasRole = (requiredRole) => {
    return async (req, res, next) => {
        try {
            if (!req.auth || !req.auth.userId) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const db = await connect();
            const user = await db.collection('users').findOne({ _id: newId(req.auth.userId) });

            if (!user || !user.role) {
                return res.status(403).json({ error: 'Role required' });
            }

            const userRoles = Array.isArray(user.role) ? user.role : [user.role];

            if (!userRoles.includes(requiredRole)) {
                return res.status(403).json({ error: `Role '${requiredRole}' required` });
            }

            next();
        } catch (err) {
            debugAuth('Error checking specific role:', err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
    };
};

export const hasPermission = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            if (!req.auth || !req.auth.userId) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const db = await connect();
            const user = await db.collection('users').findOne({ _id: newId(req.auth.userId) });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            if (!user.role || user.role.length === 0) {
                return res.status(403).json({ error: 'Permission denied' });
            }

            const userRoles = Array.isArray(user.role) ? user.role : [user.role];

            const roles = await db.collection('roles').find({
                name: { $in: userRoles }
            }).toArray();

            const hasRequiredPermission = roles.some(role =>
                role.permissions && role.permissions[requiredPermission] === true
            );

            if (!hasRequiredPermission) {
                return res.status(403).json({ error: `Permission '${requiredPermission}' required` });
            }

            next();
        } catch (err) {
            debugAuth('Error checking permission:', err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
    };
};

export const canEditBug = async (req, res, next) => {
    try {
        if (!req.auth || !req.auth.userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const { bugId } = req.params;
        const db = await connect();
        const bug = await db.collection('bugs').findOne({ _id: newId(bugId) });

        if (!bug) {
            return res.status(404).json({ error: 'Bug not found' });
        }

        if (req.auth.permissions && req.auth.permissions.canEditAnyBug) {
            return next();
        }

        if (req.auth.permissions && req.auth.permissions.canEditMyBug &&
            bug.createdBy && bug.createdBy.userId === req.auth.userId) {
            return next();
        }

        if (req.auth.permissions && req.auth.permissions.canEditIfAssignedTo &&
            bug.assignedToUserId === req.auth.userId) {
            return next();
        }

        return res.status(403).json({ error: 'Permission denied' });
    } catch (err) {
        debugAuth('Error checking bug edit permission:', err.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const canClassifyBug = async (req, res, next) => {
    try {
        if (!req.auth || !req.auth.userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const { bugId } = req.params;
        const db = await connect();
        const bug = await db.collection('bugs').findOne({ _id: newId(bugId) });

        if (!bug) {
            return res.status(404).json({ error: 'Bug not found' });
        }

        if (req.auth.permissions && req.auth.permissions.canClassifyAnyBug) {
            return next();
        }

        if (req.auth.permissions && req.auth.permissions.canEditMyBug &&
            bug.createdBy && bug.createdBy.userId === req.auth.userId) {
            return next();
        }

        if (req.auth.permissions && req.auth.permissions.canEditIfAssignedTo &&
            bug.assignedToUserId === req.auth.userId) {
            return next();
        }

        return res.status(403).json({ error: 'Permission denied' });
    } catch (err) {
        debugAuth('Error checking bug classify permission:', err.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const canReassignBug = async (req, res, next) => {
    try {
        if (!req.auth || !req.auth.userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const { bugId } = req.params;
        const db = await connect();
        const bug = await db.collection('bugs').findOne({ _id: newId(bugId) });

        if (!bug) {
            return res.status(404).json({ error: 'Bug not found' });
        }

        if (req.auth.permissions && req.auth.permissions.canReassignAnyBug) {
            return next();
        }

        if (req.auth.permissions && req.auth.permissions.canEditMyBug &&
            bug.createdBy && bug.createdBy.userId === req.auth.userId) {
            return next();
        }

        if (req.auth.permissions && req.auth.permissions.canReassignIfAssignedTo &&
            bug.assignedToUserId === req.auth.userId) {
            return next();
        }

        return res.status(403).json({ error: 'Permission denied' });
    } catch (err) {
        debugAuth('Error checking bug reassign permission:', err.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
