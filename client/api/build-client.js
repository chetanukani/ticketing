import axios from 'axios';

const buildClient = async ({ req }) => {
    //http://SERVICENAME.NAMESACE.svc.cluster.local/api/users/currentuser
    if (typeof window === 'undefined') {
        // We are on the server

        return axios.create({
            baseURL:
                'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
            headers: req.headers,
        });
    } else {
        // We must be on the browser
        return axios.create({
            baseUrl: '/',
        });
    }
};

export default buildClient;
