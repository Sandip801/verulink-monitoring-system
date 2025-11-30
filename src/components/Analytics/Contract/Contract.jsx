import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle, Edit2, Trash2, ExternalLink, X } from 'lucide-react';
import { addContract, deleteContract, editContract, fetchContractList, fetchNetworkList, mappingNetworkScan } from '../../../services/blockMonitoringServices';
import './Contract.css';

const TableRow = ({ id, address, networkId, webhookEndpoint, enabled, onEdit, onDelete }) => {
    const networkScan = mappingNetworkScan[networkId];
    const explorerUrl = networkScan ? `${networkScan.address}/${address}` : null;

    return (
        <tr className="table-row">
            <td className="table-cell">
                <span className="cell-content">{id}</span>
            </td>
            <td className="table-cell">
                <span className="cell-content">
                    {explorerUrl ? (
                        <a 
                            href={explorerUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="address-link"
                        >
                            {address}
                            <ExternalLink size={14} className="link-icon" />
                        </a>
                    ) : (
                        address
                    )}
                </span>
            </td>
            <td className="table-cell">
                <span className="cell-content">{networkId}</span>
            </td>
            <td className="table-cell">
                <span className="cell-content webhook-cell">{webhookEndpoint || '-'}</span>
            </td>
            <td className="table-cell">
                <span className={`status-badge ${enabled ? 'enabled' : 'disabled'}`}>
                    {enabled ? 'YES' : 'NO'}
                </span>
            </td>
            <td className="table-cell actions-cell">
                <button 
                    className="action-btn edit-btn" 
                    onClick={() => onEdit(address)}
                    title="Edit"
                >
                    <Edit2 size={16} />
                </button>
                <button 
                    className="action-btn delete-btn" 
                    onClick={() => onDelete(address)}
                    title="Delete"
                >
                    <Trash2 size={16} />
                </button>
            </td>
        </tr>
    );
}

const BlockMonitoringContract = () => {
    const [contractList, setContractList] = useState([]);
    const [networkList, setNetworkList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [values, setValues] = useState({
        address: '',
        abi: '',
        networkId: '',
        webhookEndpoint: '',
        enabled: false
    });

    const handleChange = (e) => {
        setValues({
            ...values,
            [e.target.name]: e.target.value,
        });
    }

    const handleClear = () => {
        setValues({
            address: '',
            abi: '',
            webhookEndpoint: '',
            networkId: '',
            enabled: false
        });
        setShowForm(false);
    }

    useEffect(() => {
        getNetworkList();
        getContractList();
    }, []);

    const getNetworkList = async () => {
        try {
            const res = await fetchNetworkList();
            if (res) {
                setNetworkList(res);
            }
        } catch (err) {
            console.error("Failed to get network list:", err);
        }
    }

    const getContractList = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetchContractList();
            if (res) {
                setContractList(res);
            } else {
                setError('Failed to fetch contract list');
            }
        } catch (err) {
            console.error("Failed to get contract list:", err);
            setError(err.message || 'Failed to fetch contract list');
        } finally {
            setLoading(false);
        }
    }

    const handleEditClick = (address) => {
        const contract = contractList.find(contract => contract.address === address);
        if (contract) {
            setValues({
                ...values,
                ...contract
            });
            setShowForm(true);
        }
    }

    const handleDelete = async (address) => {
        if (!window.confirm('Are you sure you want to delete this contract?')) {
            return;
        }

        try {
            const res = await deleteContract(address);
            if (res) {
                const currentList = contractList.filter(contract => contract.address !== address);
                setContractList(currentList);
            } else {
                setError('Failed to delete contract');
            }
        } catch (err) {
            console.error("Failed to delete:", err);
            setError(err.message || 'Failed to delete contract');
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            let res;
            if (values.id) {
                res = await editContract(values);
            } else {
                res = await addContract(values);
            }

            if (res) {
                await getContractList();
                handleClear();
            } else {
                setError('Failed to save contract');
            }
        } catch (err) {
            console.error("Failed to save:", err);
            setError(err.message || 'Failed to save contract');
        }
    }

    return (
        <div className="analytics-contract">
            <div className="contract-header">
                <h2 className="contract-title">Manage Contract</h2>
                <div className="header-actions">
                    <button
                        className={`refresh-btn ${loading ? 'loading' : ''}`}
                        onClick={getContractList}
                        disabled={loading}
                        title="Refresh data"
                    >
                        <RefreshCw size={18} className={loading ? 'spinning' : ''} />
                        <span>Refresh</span>
                    </button>
                    {!showForm && (
                        <button
                            className="add-btn"
                            onClick={() => setShowForm(true)}
                        >
                            Add Contract
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="error-banner">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            {showForm && (
                <div className="form-container">
                    <div className="form-header">
                        <h3>{values.id ? 'Edit Contract' : 'Add New Contract'}</h3>
                        <button className="close-btn" onClick={handleClear}>
                            <X size={20} />
                        </button>
                    </div>
                    <form className="contract-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="address">Contract Address *</label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={values.address}
                                placeholder="Enter contract address"
                                onChange={handleChange}
                                disabled={!!values.id}
                                required
                                className="form-input"
                            />
                        </div>

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
                            <label htmlFor="abi">ABI *</label>
                            <textarea
                                id="abi"
                                name="abi"
                                rows={4}
                                value={values.abi}
                                placeholder="Enter ABI"
                                onChange={handleChange}
                                required
                                className="form-textarea"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="webhookEndpoint">Webhook Endpoint *</label>
                            <input
                                type="text"
                                id="webhookEndpoint"
                                name="webhookEndpoint"
                                value={values.webhookEndpoint}
                                placeholder="Enter webhook endpoint"
                                onChange={handleChange}
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="switch-label">
                                <span>Enabled *</span>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        name="enabled"
                                        checked={values.enabled}
                                        onChange={(e) => {
                                            setValues((prev) => ({ ...prev, enabled: e.target.checked }));
                                        }}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </label>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="submit-btn">
                                {values.id ? 'Save' : 'Create'}
                            </button>
                            <button type="button" onClick={handleClear} className="cancel-btn">
                                {values.id ? 'Cancel' : 'Clear'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="contract-table-container">
                <div className="table-wrapper">
                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>Loading contracts...</p>
                        </div>
                    ) : (
                        <table className="contract-table">
                            <thead>
                                <tr>
                                    <th className="table-header">ID</th>
                                    <th className="table-header">Address</th>
                                    <th className="table-header">Network ID</th>
                                    <th className="table-header">Webhook Endpoint</th>
                                    <th className="table-header">Enabled</th>
                                    <th className="table-header">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contractList?.length > 0 ? (
                                    contractList.map((contract, index) => (
                                        <TableRow
                                            key={`${contract.address}-${index}`}
                                            {...contract}
                                            onEdit={handleEditClick}
                                            onDelete={handleDelete}
                                        />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="table-empty">
                                            No contracts found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BlockMonitoringContract;

