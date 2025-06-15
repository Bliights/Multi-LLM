import initializeModels from "./models/associations";
import express from "express";
import userRouter from "./routes/userRoute";
import modelRoute from "./routes/modelRoute";
import userApiKeysRoute from "./routes/userApiKeysRoute";

initializeModels();
const app = express();
app.use(express.json());

// Routes
app.use("/users",userRouter);

app.use("/models", modelRoute);

app.use("/user-api-keys", userApiKeysRoute);

app.listen(3000,()=>{
    console.log("Starting Server at http://localhost:3000/");
});