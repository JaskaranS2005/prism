import express from "express";
import compression from "compression";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import notFound from "./middleware/notFound.middleware.js";
import errorHandler from "./middleware/error.middleware.js";

import routes from "./routes/index.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

app.use("/api/v1", routes);

app.use(notFound);
app.use(errorHandler);

export default app;
