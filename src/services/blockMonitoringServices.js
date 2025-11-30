import axios from "axios";

const BLOCK_MONITORING_URL = import.meta.env.VITE_APP_BLOCK_MONITORING_URL;

const axiosWebApi = axios.create({
    baseURL: BLOCK_MONITORING_URL,
    headers: {
        'content-type': 'application/json',
        'accept': 'application/json'
    }
});

axiosWebApi.interceptors.response.use((response) => response.data, (error) => Promise.reject(error));

const BLOCKMONTORING_API = {
    ADD_NETWORK: '/add-network',
    GET_NETWORK: '/get-networks',
    EDIT_NETWORK: '/edit-network',
    DELETE_NETWORK: '/delete-network',
    ADD_CONTRACT: '/add-contract',
    GET_CONTRACT: '/get-contracts',
    EDIT_CONTRACT: '/edit-contract',
    DELETE_CONTRACT: '/delete-contract',
    ADD_EVENT: '/add-event',
    GET_EVENT: '/get-events',
    EDIT_EVENT: '/edit-event',
    DELETE_EVENT: '/delete-event',
    GET_BLOCK_OVERVIEW: '/get-block-overview',
    SYNC_MISSING_BLOCKS: '/sync-missing-blocks',
    GET_EVENT_LOGS: '/get-event-logs'
}

export const mappingNetworkScan = {
    80001: {
        transaction: 'https://mumbai.polygonscan.com/tx',
        address: 'https://mumbai.polygonscan.com/address',
        block: 'https://mumbai.polygonscan.com/block'
    },
    137: {
        transaction: 'https://polygonscan.com/tx',
        address: 'https://polygonscan.com/address',
        block: 'https://polygonscan.com/block'
    },
    4: {
        transaction: 'https://rinkeby.etherscan.io/tx',
        address: 'https://rinkeby.etherscan.io/address',
        block: 'https://rinkeby.etherscan.io/block',
    },
    5: {
        transaction: 'https://goerli.etherscan.io/tx',
        address: 'https://goerli.etherscan.io/address',
        block: 'https://goerli.etherscan.io/block',
    },
    97: {
        transaction: 'https://testnet.bscscan.com/tx',
        address: 'https://testnet.bscscan.com/address',
        block: 'https://testnet.bscscan.com/block'
    },
    56: {
        transaction: 'https://bscscan.com/tx',
        address: 'https://bscscan.com/address',
        block: 'https://bscscan.com/block'
    },
    80002: {
        transaction: 'https://amoy.polygonscan.com/tx',
        address: 'https://amoy.polygonscan.com/address',
        block: 'https://amoy.polygonscan.com/block'
    },
    8453: {
        transaction: 'https://basescan.org/tx',
        address: 'https://basescan.org/address',
        block: 'https://basescan.org/block'
    },
    84532: {
        transaction: 'https://sepolia.basescan.org/tx',
        address: 'https://sepolia.basescan.org/address',
        block: 'https://sepolia.basescan.org/block'
    },
    1: {
        transaction: 'https://sepolia.basescan.org/tx',
        address: 'https://sepolia.basescan.org/address',
        block: 'https://sepolia.basescan.org/block'
    }
}

export const fetchNetworkList = async () => {
    try {
        let response = await axiosWebApi.get(BLOCKMONTORING_API.GET_NETWORK);
        console.log("Network list", response);
        return response.result;
    } catch (e) {
        console.log(e);
    }
}

export const addNetwork = async (payload) => {
    try {
        let response = await axiosWebApi.post(BLOCKMONTORING_API.ADD_NETWORK, payload);
        return response;
    } catch (e) {
        console.log(e);
    }
}

export const editNetwork = async (payload) => {
    try {
        let response = await axiosWebApi.patch(BLOCKMONTORING_API.EDIT_NETWORK, payload);
        return response;
    } catch (e) {
        console.log(e);
    }
}

export const deleteNetwork = async (networkId) => {
    try {
        let response = await axiosWebApi.delete(BLOCKMONTORING_API.DELETE_NETWORK, { data: { networkId: networkId } });
        return response;
    } catch (e) {
        console.log(e);
    }
}

export const fetchContractList = async (params) => {
    try {
        const response = await axiosWebApi.get(BLOCKMONTORING_API.GET_CONTRACT, { params });
        console.log("Contract list", response);
        return response.result;
    } catch (e) {
        console.log(e);
    }
}

export const addContract = async (payload) => {
    try {
        let response = await axiosWebApi.post(BLOCKMONTORING_API.ADD_CONTRACT, payload);
        return response;
    } catch (e) {
        console.log(e);
    }
}

export const editContract = async (payload) => {
    try {
        let response = await axiosWebApi.patch(BLOCKMONTORING_API.EDIT_CONTRACT, payload);
        return response;
    } catch (e) {
        console.log(e);
    }
}

export const deleteContract = async (address) => {
    try {
        let response = await axiosWebApi.delete(BLOCKMONTORING_API.DELETE_CONTRACT, { data: { address: address } });
        return response;
    } catch (e) {
        console.log(e);
    }
}

export const fetchEventList = async (params) => {
    try {
        let response = await axiosWebApi.get(BLOCKMONTORING_API.GET_EVENT, { params });
        console.log("Events list", response);
        return response.result;
    } catch (e) {
        console.log(e);
    }
}

export const addEvent = async (payload) => {
    try {
        let response = await axiosWebApi.post(BLOCKMONTORING_API.ADD_EVENT, payload);
        return response;
    } catch (e) {
        console.log(e);
        // eslint-disable-next-line no-throw-literal
        throw e?.response?.data;
    }
}

export const editEvent = async (payload) => {
    try {
        let response = await axiosWebApi.patch(BLOCKMONTORING_API.EDIT_EVENT, payload);
        return response;
    } catch (e) {
        console.log(e);
    }
}

export const deleteEvent = async (id) => {
    try {
        let response = await axiosWebApi.delete(BLOCKMONTORING_API.DELETE_EVENT, { data: { id: id } });
        return response;
    } catch (e) {
        console.log(e);
    }
}

export const fetchBlockOverviewList = async () => {
    try {
        let response = await axiosWebApi.get(BLOCKMONTORING_API.GET_BLOCK_OVERVIEW);
        return response.result;
    } catch (e) {
        console.log(e);
    }
}

export const syncMissingBlocks = async (params) => {
    await axiosWebApi.post(BLOCKMONTORING_API.SYNC_MISSING_BLOCKS, {}, { params });
}

export const fetchEventLogsList = async (params) => {
    try {
        const response = await axiosWebApi.get(BLOCKMONTORING_API.GET_EVENT_LOGS, { params });
        console.log("Event logs list", response.result);
        return response.result;
    } catch (e) {
        console.log(e);
    }
}

