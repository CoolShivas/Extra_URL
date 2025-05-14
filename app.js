// console.log("Formation of Backend File.");
// console.log("To render the server i.e., port localhost as well as CRUD operation.");
// console.log("CRUD means the requests for the Create, Read, Undo, Delete.");
// console.log("i.e., GET, POST,Patch, EDIT, DELETE");
// // // // Here, we are getting the Output on Terminal as :-
// // // // Formation of Backend File.
// // // // To render the server i.e., port localhost as well as CRUD operation.
// // // // CRUD means the requests for the Create, Read, Undo, Delete.
// // // // i.e., GET, POST,Patch, EDIT, DELETE
// // // // Completed running 'backend.js'


import { readFile, writeFile } from "fs/promises";
import {createServer} from "http";
import path from "path";
import crypto from "crypto";
 
 
 
const PORT = 5000;

const DATA_FILE = path.join("data", "links.json");
// // Created the data file and showing its location where to store the url and links;


const getRidOfDoNotRepeatCodeAgain = async (response, filePath, contentType) => {
    try {
        const dataHandle = await readFile(filePath);
        response.writeHead(200, {"Content-Type" : contentType});
        response.end(dataHandle);
    } catch (error) {
        response.writeHead(404, {"Content-Type" : "text/plain"});
        // Showing the content plain text with error page message;
        response.end("404 Page not found");
    }
};


const loadLinks = async () => {
    try {
        const data = await readFile(DATA_FILE, 'utf-8');
        // // Reading the url of the load link whether it is duplicate or not;
        return JSON.parse(data);
        // // Converting it to json format;
    } catch (error) {
        if(error.code === "ENOENT")
        {
            await writeFile(DATA_FILE, JSON.stringify({}));
            // // If there is no duplicate or it is new one then storing it into new object with the stringify it;
            return {};
        }
        throw error;// Over-all throwing the error. If all the condition not match;
    }
};


const saveLinks = async (links) => {
    await writeFile(DATA_FILE, JSON.stringify(links));
    // // Saving the links i.e., getting from the frontend or by user enter on the fields i.e, {urlURL, shortCode};
    // // Converting agian the data into strings;
};



 const serverFile = createServer( async (request, response) => {
    console.log(request.url);
    // // // Getting the data on Terminal;
    // // // /
    // // // /style.css
    // // // /favicon.ico
     if(request.method === "GET")// Request hitted to GET method of server to take data from it;
         {
             if(request.url === "/") // Request hitted to url / page or home page;
             {
                 return getRidOfDoNotRepeatCodeAgain(response, path.join("public", "index.html"), "text/html");
             }
             else if(request.url === "/style.css")// Request hitted to url /style.css for home page only;
             {
                return getRidOfDoNotRepeatCodeAgain(response, path.join("public", "index.css"), "text/css");
             }
             else if(request.url === "/links")
            {
                // // Creating an API for frontend purpose i.e, the store links in data folder i.e, enter by user and stored by backend in data folder links.json() file;
                const links = await loadLinks(); 
                // // Getting the store links data here in this url again i.e,("/links");
                response.writeHead(200, {"Content-Type" : "application/json"});
                // // If the Response is 200 then content will display;
                return response.end(JSON.stringify(links));
                // // Response end and clearly shown the links into converted format because it is in json format converted into string format;
            }
            else
            {
                const links = await loadLinks(); 
                // // Getting the links here for redirecting the links;
                const shortCode = request.url.slice(1);
                // // Use of slice(1); Here, remove of starting coming slice such as "/chai";
                console.log("Link redirected => ", request.url);
                // // Here, we are getting the Output on Terminal as :-
                // // /
                // // /style.css
                // // /shorten
                // // {"url":"https://www.youtube.com/watch?v=iSNvKaVtwTU","shortCode":"chai"}
                // // /links
                // // /links
                // // /chai
                // // Link redirected =>  /chai
                if(links[shortCode]) // Getting all links and from that particular shortCode link;
                {
                    response.writeHead(302, {location : links[shortCode]});
                    // // 302 means that page found;
                    return response.end(); 
                    // // Ending the response by giving the result;
                }
                else 
                {
                    response.writeHead(404, {"Content-Type" : "text/plain"});
                    return response.end("Shortend URL is not found");
                    // // If page not found after clicking the shortCode link;
                }
            }
         }
         if(request.method === "POST")// Request hitted to POST method of server to update or post data into it;
         {
            if(request.url === "/shorten")// Request hitted to url /shorten page;
            {
                const links = await loadLinks();// Loading or uploading the new link and checking for the duplicacy;
                let body = "";
                request.addListener("data", (chunk) => {
                    // // Tiggering the "data" event of .on or .addListener response;
                    // // And taking it into small chunks instead of whole at once;
                    body = body + chunk;
                });
                request.addListener("end", async () => {
                    // // Tiggering the "end" event of .on or .addListener when server response ends;
                    // // And, converting the data into js object;
                    console.log(body);
                    const {url, shortCode} = JSON.parse(body); 
                    // // Converting the data into javascript object and saving it on body variable;
                    // // This urlURL = url and shortCode should match with the frontend file too. For the clear memory storage;
                    if(!url) // If there is no url;
                    {
                        response.writeHead(400, {"Content-Type" : "text/plain"});
                        // // If url is not there, showing the text plain area;
                        return response.end("URL is required");
                    }

                    // // Checking the duplicate in backend;
                    const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex");
                    // // Getting shortCode if that url is not short then with the help of crypto make it shorter;

                    if(links[finalShortCode])
                    {
                        response.writeHead(400, {"Content-Type" : "text/plain"});
                        // // Showing the plain or blank fields for entering the data;
                        return response.end("Short Code already exist. Please choose another!")
                        // // Showing the error if duplicate exists;
                    }
                    
                    links[finalShortCode] = url; 
                    // //Saving the new url and shortCode to links in object of array type i.e, by links[finalShortCode];
                    // // This urlURL = url and shortCode should match with the Frontend file too. For the clear memory storage; 

                    await saveLinks(links);
                    // Saving the links of the Frontend to Backend data base in the data folder;

                    response.writeHead(200, {"Content-Type" : "application/json"});
                    response.end(JSON.stringify({success : true, shortCode : finalShortCode}));
                    // // Showing the content of the Backend on Frontend look on the browser;

                });
            }
         }

 });




 serverFile.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
 });