"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv-safe/config");
require("../types/types");
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const ErrorHandler_1 = __importDefault(require("./middlewares/ErrorHandler"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const jobRoutes_1 = __importDefault(require("./routes/jobRoutes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
// cors and bodyparser middleware
if (process.env.NODE_ENV === 'development') {
    app.use((0, cors_1.default)({
        origin: '*',
        allowedHeaders: ['Origin', 'Content-Type', 'Authorization']
    }));
    // Root route handler
    app.get('/', (req, res) => {
        console.log('test');
        res.send('hello!');
    });
    app.use((0, morgan_1.default)('dev'));
}
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Public API routes with basic rate limiting
// app.use('/api/public', publicRateLimit, publicRoutes);
// Protected routes with higher rate limits
// app.use('/api/protected', requireAuth, authenticatedRateLimit, protectedRoutes);
// api routes
// app.use('/api/auth', publicRateLimit, authRoutes);
app.use('/api/auth', authRoutes_1.default);
app.use('/api/jobs', jobRoutes_1.default);
// error handling middleware after routes
app.use(ErrorHandler_1.default);
// serve static files and fallback to index.html for client-side routing
if (process.env.NODE_ENV === 'production') {
    app.use(express_1.default.static(path_1.default.join(__dirname, '../../frontend/build')));
    app.get('*', (req, res) => {
        res.sendFile(path_1.default.join(__dirname, '../../frontend/build', 'index.html'));
    });
}
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map