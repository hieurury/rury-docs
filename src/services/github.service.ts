import axios from "axios";
const HOST ='http://localhost:3000';

async function getCollaberators() {
    const response = await axios.get(`${HOST}/collaberators`);
    const data = response.data;
    return data;
}

export default {
    getCollaberators
}