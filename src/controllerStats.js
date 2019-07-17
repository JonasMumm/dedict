const model = require("./model.js");
const fs = require('fs');

let timerUpdate=undefined;
const targetPlayers=400;

module.exports = {

    actionNewDeath: function(req,res)
    {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        console.log("LETS DO THIS");
        const token = req.params.token;
        
        tokenValidate(token,(segmentID)=>{
            if(segmentID!==undefined)
            {
            tokenCheckAvailable(token,(available)=>{
                if(available)
                {
                    tokenSave(token,()=>
                    {

                            if(timerUpdate===undefined)
                            {
                            timerUpdate=setTimeout(statfileUpdate,23000); 
                            //update every 23 sec at max
                            }
                
                res.end("");
                            

                        
                    });
                }
                else
                {
                res.end("");
                }
            })
            }
            else
            {
                res.end("");
            }
            });
        
    },
    
    actionStatsCurrent:function (req,res)
{
    
    //first gather data
            model.execute(`SELECT count(token) FROM tokens`,
            undefined,(rowsCount)=>{
                const count=rowsCount[0][`count(token)`];
                
    const strJSON = JSON.stringify({progress:count/targetPlayers,players:count});
    
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end("Currents statistics: /n"+strJSON);
    });
}
,
init:function()
{
    console.log("Initializing json output...")
    statfileUpdate();
}

}

function tokenValidate(token,next)
{
    let segment_id=undefined;
    
    //The rules are as follows:
    //tokens only contain characters a-z;
    //a=0 ..z=25;
    //segment id  is constructed through: [15]*10+[0].
    //[1]=random value 1..25
    //[2]=random value 0..6
    //[3]=random value 9..15
    //[4]=random value 0..25
    //[5]=random value 0..6
    //[6]=random value 0..6
    //[7]=random value 0..[1]-1
    //[8]=25-[4]
    //[9]=[3]-[5]+[6]
    //[10]=random value 20..24
    //[11]=[6]+[6]+[18]
    //[12]=[10]-[2]-[5]
    //[13]=random value 7..25
    //[14]=random value 10..19
    //[16]=[10]-[14]+[18]
    //[17]=[13]-[2]
    //[18]=random value 0..5
    //[19]=random value 0..5
    //[20]=[18]*[19]
    //[21]=random value 10..18
    //[22]=[3]-9+[2]+[5]
    //[23]=[21]+[5]-[6]
    //[24]=[21]-[6]+[19]
    //[25]=[15]*10+[0]
    
    if(token.length===26)
    {
        if(between(tokenGet(token,1),1,25))
        {
        if(between(tokenGet(token,2),0,6))
        {
                    if(between(tokenGet(token,3),9,15))
        {
                    if(between(tokenGet(token,4),0,25))
        {
                    if(between(tokenGet(token,5),0,6))
        {
                    if(between(tokenGet(token,6),0,6))
        {
                                if(tokenGet(token,7)<tokenGet(token,1))
        {
            if(tokenGet(token,8)===25-tokenGet(token,4))
            {
                if(tokenGet(token,9)===tokenGet(token,3)-tokenGet(token,5)+tokenGet(token,6))
                {
                    if(between(tokenGet(token,10),20,24))
                    {
                        if(tokenGet(token,11)===tokenGet(token,6)*2+tokenGet(token,18))
                        {
                if(tokenGet(token,12)===tokenGet(token,10)-tokenGet(token,2)-tokenGet(token,5))
                { 
                if(between(tokenGet(token,13),7,25))
                    {
                     if(between(tokenGet(token,14),10,19))
                    {
                if(tokenGet(token,16)===tokenGet(token,10)-tokenGet(token,14)+tokenGet(token,18))
                { 
        if(tokenGet(token,17)===tokenGet(token,13)-tokenGet(token,2))
                { 
                                 if(between(tokenGet(token,18),0,5))
                    {
if(between(tokenGet(token,19),0,5))
                    {
    if(tokenGet(token,20)===tokenGet(token,18)*tokenGet(token,19))
    {
        if(between(tokenGet(token,21),10,18))
        {
      if(tokenGet(token,22)===tokenGet(token,3)-9+tokenGet(token,2)+tokenGet(token,5))
    {
              if(tokenGet(token,23)===tokenGet(token,21)+tokenGet(token,5)-tokenGet(token,6))
    {
                      if(tokenGet(token,24)===tokenGet(token,21)-tokenGet(token,6)+tokenGet(token,19))
    {
    if(tokenGet(token,25)===tokenGet(token,15)*10+tokenGet(token,0))
    {
        //sucess!
        segment_id=tokenGet(token,25);
    }
    }
    }
    }
    }
    }
    }
    }
    }                   
    }
    }
    }
    }
    }
    }
    }
            }
    }
    }
    }
    }
    }
    }
    }
    }
        
    
    
    
    next(segment_id);
}

function tokenCheckAvailable(token,next)
{
model.execute(`SELECT token FROM tokens WHERE token=$t`,{$t:token},(rows)=>
{
            if(rows.length===0)
            {
                next(true);
            }
            else
            {
                next(false);
            }
});
}

function tokenSave(token,next)
{
    model.execute(`INSERT INTO tokens (token) VALUES ($t);`,
    {$t:token},()=>{next()});
}
    

function statfileUpdate()
{
    timerUpdate=undefined;
    //first gather data
            model.execute(`SELECT count(token) FROM tokens`,
            undefined,(rowsCount)=>{
                const count=rowsCount[0][`count(token)`];
                
                
                let progress=count/targetPlayers;
    const strJSON = JSON.stringify({progress,players:count});
    fs.writeFile("public/stats.json", strJSON,()=>{console.log("Write of JSON file done")});
    
            });
}



function tokenGet(token,index)
{
    //returns ascii value of token character at index
    //index is 0 based
return token.charCodeAt(index)-97;
}

function between(val,mini,maxi)
{
    return (val>=mini && val<=maxi)
}

