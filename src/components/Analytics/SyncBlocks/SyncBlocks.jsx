import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle, CheckCircle, X } from 'lucide-react';
import { fetchContractList, fetchNetworkList, syncMissingBlocks } from '../../../services/blockMonitoringServices';
import './SyncBlocks.css';

const BlockMonitoringSyncBlock = () => {
    const [networkList, setNetworkList] = useState([]);
    const [contractList, setContractList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [values, setValues] = useState({
        networkId: '',
        from: '',
        to: '',
        contractAddress: []
    });

    const handleChange = (e) => {
        setError(null);
        setMessage(null);
        setValues({
            ...values,
            [e.target.name]: e.target.value,
        });
    }

    const getContractList = async (payload) => {
        try {
            const res = await fetchContractList(payload);
            if (res) {
                setContractList(res);
                setValues((prev) => ({ ...prev, contractAddress: [] }));
            } else {
                setError('Failed to fetch contract list');
            }
        } catch (err) {
            console.error("Failed to get contract list:", err);
            setError(err.message || 'Failed to fetch contract list');
        }
    }

    const handleClear = () => {
        setValues({
            networkId: '',
            from: '',
            to: '',
            contractAddress: []
        });
        setMessage(null);
        setError(null);
        setContractList([]);
    }

    useEffect(() => {
        if (values.networkId) {
            getContractList({ networkId: values.networkId });
        } else {
            setContractList([]);
        }
    }, [values.networkId]);

    useEffect(() => {
        getNetworkList();
    }, []);

    const getNetworkList = async () => {
        try {
            const res = await fetchNetworkList();
            if (res) {
                setNetworkList(res);
            } else {
                setError('Failed to fetch network list');
            }
        } catch (err) {
            console.error("Failed to get network list:", err);
            setError(err.message || 'Failed to fetch network list');
        }
    }

    const handleContractChange = (e) => {
        const { selectedOptions } = e.target;
        const selectedAddresses = Array.from(selectedOptions)
            .filter(option => option.value)
            .map(option => option.value);
        
        setValues((prev) => ({ 
            ...prev, 
            contractAddress: selectedAddresses 
        }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        setLoading(true);

        try {
            await syncMissingBlocks(values);
            setMessage({ 
                success: true, 
                message: 'Blocks synced successfully' 
            });
            handleClear();
        } catch (err) {
            console.error('Error syncing blocks:', err);
            setMessage({ 
                success: false, 
                message: err.message || 'Error while syncing blocks' 
            });
        } finally {
            setLoading(false);
            if (message?.success) {
                const errorDisplayDuration = parseInt(import.meta.env.VITE_ERROR_DISPLAY_DURATION) || 5000;
                setTimeout(() => {
                    setMessage(null);
                }, errorDisplayDuration);
            }
        }
    }

    return (
        <div className="analytics-sync-blocks">
            <div className="sync-blocks-header">
                <h2 className="sync-blocks-title">Sync Missing Blocks</h2>
            </div>

            {(error || (message && !message.success)) && (
                <div className="error-banner">
                    <AlertCircle size={18} />
                    <span>{error || message?.message}</span>
                </div>
            )}

            {message && message.success && (
                <div className="success-banner">
                    <CheckCircle size={18} />
                    <span>{message.message}</span>
                </div>
            )}

            <div className="form-container">
                <form className="sync-blocks-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="networkId">Network *</label>
                        <select
                            id="networkId"
                            name="networkId"
                            value={values.networkId}
                            onChange={handleChange}
                            required
                            className="form-select"
                        >
                            <option value="">Select network</option>
                            {networkList.map((network) => (
                                <option key={network.networkId} value={network.networkId}>
                                    {network.networkId}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="contractAddress">Contract *</label>
                        <select
                            id="contractAddress"
                            name="contractAddress"
                            multiple={contractList.length > 0}
                            value={values.contractAddress}
                            onChange={handleContractChange}
                            required
                            className={`form-select ${contractList.length > 0 ? 'form-select-multiple' : ''}`}
                            disabled={contractList.length === 0}
                        >
                            {contractList.length > 0 ? (
                                contractList.map((contract) => (
                                    <option key={contract.address} value={contract.address}>
                                        {contract.address}
                                    </option>
                                ))
                            ) : (
                                <option value="">Select Contract</option>
                            )}
                        </select>
                        {contractList.length > 0 && (
                            <span className="form-hint">
                                Hold Ctrl (or Cmd on Mac) to select multiple contracts
                            </span>
                        )}
                        {values.contractAddress.length > 0 && (
                            <div className="selected-contracts">
                                <span className="selected-label">Selected: {values.contractAddress.length} contract(s)</span>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="from">Block From *</label>
                        <input
                            type="number"
                            id="from"
                            name="from"
                            value={values.from}
                            placeholder="Enter block number"
                            onChange={handleChange}
                            required
                            min="0"
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="to">Block To *</label>
                        <input
                            type="number"
                            id="to"
                            name="to"
                            value={values.to}
                            placeholder="Enter block number"
                            onChange={handleChange}
                            required
                            min="0"
                            className="form-input"
                        />
                    </div>

                    <div className="form-actions">
                        <button 
                            type="submit" 
                            className="submit-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <RefreshCw size={18} className="spinning" />
                                    <span>Syncing...</span>
                                </>
                            ) : (
                                'Sync'
                            )}
                        </button>
                        <button 
                            type="button" 
                            onClick={handleClear} 
                            className="cancel-btn"
                            disabled={loading}
                        >
                            Clear
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default BlockMonitoringSyncBlock;

