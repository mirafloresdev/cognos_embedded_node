import fetch from 'node-fetch';
import express from 'express';
import {createProxyMiddleware} from 'http-proxy-middleware';
import cors from 'cors';


const app = express();
const PORT = 3000;
const CAMNamespace = 'Harmony LDAP';
const CAMUsername = 'pm';
const CAMPassword = 'IBMDem0s';

app.get('/', (req, res) => {
    res.send('Cognos Analytics Embedding Service is running!');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

app.use(cors({
    origin: 'http://useast.services.cloud.techzone.ibm.com:42845'
}));


async function authenticateCognos() {
    const url = 'http://useast.services.cloud.techzone.ibm.com:42845/bi/v1/disp/rds/auth/logon'; // Asegúrate de que esta es la URL correcta
    const xmlData = `<auth:credentials xmlns:auth='http://developer.cognos.com/schemas/ccs/auth/types/1'>
        <auth:credentialElements><auth:name>CAMNamespace</auth:name><auth:value><auth:actualValue>${process.env.COGNOS_NAMESPACE}</auth:actualValue></auth:value></auth:credentialElements>
        <auth:credentialElements><auth:name>CAMUsername</auth:name><auth:value><auth:actualValue>${process.env.COGNOS_USERNAME}</auth:actualValue></auth:value></auth:credentialElements>
        <auth:credentialElements><auth:name>CAMPassword</auth:name><auth:value><auth:actualValue>${process.env.COGNOS_PASSWORD}</auth:actualValue></auth:value></auth:credentialElements>
    </auth:credentials>`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/xml'},
            body: xmlData
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const cookies = response.headers.get('set-cookie');
        return {cookies};
    } catch (error) {
        console.error('Error during Cognos authentication:', error);
        return null;
    }
}


app.get('/embed', async (req, res) => {
    const authData = await authenticateCognos();
    if (authData) {
        const htmlContent = `<!DOCTYPE html>
        <html>
        <head><title>Embedded Cognos Report</title>
                <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
                   <style>
                   body {
                        background-color: #D3DAE4;
                        font-family: 'Arial', sans-serif;
                    }
                    
                    .card {
                        width: 1200px;
                        height: 800px;
                        border-radius: 15px;
                        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                    }
                    
                    .card-header {
                        background-color: #ffffff;
                        border-top-left-radius: 15px;
                        border-top-right-radius: 15px;
                    }
                    
                    .card-body {
                        background-color: #ffffff;
                        border-bottom-left-radius: 15px;
                        border-bottom-right-radius: 15px;
                        padding: 30px;
                    }
                    
                    .img-fluid {
                        margin: 20px 0;
                    }
                    
                    .btn-outline-primary {
                        border-color: #007bff;
                        color: #007bff;
                    }

</style>
        </head>
        <body>
            <div class="container d-flex justify-content-center align-items-center vh-100">
                <div class="card shadow-lg text-center">
                    <div class="card-header font-weight-bold">
                        <i class="fas fa-credit-card"></i> Embedded Cognos
                    </div>
                    <div class="card-body">
                        <iframe src="https://sigtest.mh.gob.sv/ibmcognos/dashboardPrueba/dashboardPrueba.html"></iframe>
                    </div>
                </div>
            </div>
            <script src="https://kit.fontawesome.com/a076d05399.js"></script>
        
          
        
            
        </body>
        </html>`;
        res.send(htmlContent);
    } else {
        res.status(401).send('Authentication failed');
    }
});






