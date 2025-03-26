import express from "express";
import rateLimit from "express-rate-limit";
import path from "path";
import { auth } from "express-oauth2-jwt-bearer";
import dotenv from "dotenv";
import routes from "./routes";

dotenv.config();

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

// const checkJwt = auth({
//   audience: process.env.AUTH0_AUDIENCE,
//   issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
//   tokenSigningAlg: "RS256",
// });

app.use(limiter);
app.use(express.json());

app.use(
  "/static",
  express.static(path.join(__dirname, "../public"), {
    dotfiles: "deny",
    index: false,
    redirect: false,
  })
);
app.use("/static/*", (req: express.Request, res: express.Response) => {
  res.status(403).send("Access denied");
});

// app.use("/api", checkJwt, routes);
app.use("/api", routes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
