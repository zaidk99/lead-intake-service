import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err,_req,res,_next) => {
    if(err instanceof SyntaxError && "body" in err){
        res.status(400).json({error: "invalid json"});
        return;
    }
    console.error(err);
    res.status(500).json({
        error : "internal server error"
    });
};


