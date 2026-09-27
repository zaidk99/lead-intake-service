import {Router} from "express";

import {
    getLead,
    listLead,
    updateLeadContact,
    updateLeadStatus,
} from "../services/leadService";

import {
    parseContactBody,
    parseListQuery,
    parseStatusBody,
} from "../validators/leadValid";


export const leadRouter = Router();

leadRouter.get("/",async(req,res)=>{
    const query = parseListQuery(req.query);
    if(!query.ok){
        res.status(400).json({error: "invalid list query"});
        return;
    }
    const result = await listLead(query);

    res.json(result);
});

leadRouter.get("/:id",async(req,res)=>{
    const lead = await getLead(req.params.id);
    if(!lead){
        res.status(404).json({error: "lead not found"});
        return;
    }
    res.json(lead);
});

leadRouter.patch("/:id/status",async(req,res)=>{
    const body = parseStatusBody(req.body);
    if(!body.ok){
        res.status(400).json({error:"invalid status"});
        return;
    }

    const result = await updateLeadStatus(req.params.id , body.status);
    if(!result.ok && result.reason === "missing"){
        res.status(404).json({error: "lead not found"});
        return;
    }

    if(!result.ok){
        res.status(400).json({error: "status is unchanged"});
        return;
    }
    res.json(result.lead);
});

leadRouter.patch("/:id",async(req,res)=>{
    const body = parseContactBody(req.body);
    if(!body.ok){
        res.status(400).json({error:"invalid contact update"});
        return;
    }

    const result = await updateLeadContact(req.params.id, body.data);
    if(!result.ok && result.reason === "missing"){
        res.status(404).json({error: "lead not found"});
        return;
    }
    if(!result.ok){
        res.status(400).json({error:"contact is unchanged"});
        return;
    }
    res.json(result.lead);
});


