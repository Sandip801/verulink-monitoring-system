import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle, Edit2, Trash2, X } from 'lucide-react';
import { addNetwork, deleteNetwork, editNetwork, fetchNetworkList } from '../../../services/blockMonitoringServices';
import './Network.css';

const TableRow = ({ id, networkId, rpcUrl, websocketUrl, subscribed, onEdit, onDelete }) => {
    return (
        <tr className="table-row">
            <td className="table-cell">
                <span className="cell-content">{id}</span>
            </td>
            <td className="table-cell">
                <span className="cell-content network-id">{networkId}</span>
            </td>
            <td className="table-cell">
                <span className="cell-content url-cell">{rpcUrl || '-'}</span>
            </td>
            <td className="table-cell">
                <span className="cell-content url-cell">{websocketUrl || '-'}</span>
            </td>
            <td className="table-cell">
                <span className={`status-badge ${subscribed ? 'subscribed' : 'not-subscribed'}`}>
                    {subscribed ? 'YES' : 'NO'}
                </span>
            </td>
            <td className="table-cell actions-cell">
                <button 
                    className="action-btn edit-btn" 
                    onClick={() => onEdit(networkId)}
                    title="Edit"
                >
                    <Edit2 size={16} />
                </button>
                <button 
                    className="action-btn delete-btn" 
                    onClick={() => onDelete(networkId)}
                    title="Delete"
                >
                    <Trash2 size={16} />
                </button>
            </td>
        </tr>
    );
}

const BlockMonitoringNetwork = () => {
    const [networkList, setNetworkList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [values, setValues] = useState({
        networkId: '',
        rpcUrl: '',
        websocketUrl: '',
        subscribed: false
    });

    const handleChange = (e) => {
        setValues({
            ...values,
            [e.target.name]: e.target.value,
        });
    }

    const handleClear = () => {
        setValues({
            networkId: '',
            rpcUrl: '',
            websocketUrl: '',
            subscribed: false
        });
        setShowForm(false);
    }

    useEffect(() => {
        getNetworkList();
    }, []);

    const getNetworkList = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetchNetworkList();
            if (res) {
                setNetworkList(res);
            } else {
                setError('Failed to fetch network list');
            }
        } catch (err) {
            console.error("Failed to get network list:", err);
            setError(err.message || 'Failed to fetch network list');
        } finally {
            setLoading(false);
        }
    }

    const handleEditClick = (networkId) => {
        const network = networkList.find(network => network.networkId === networkId);
        if (network) {
            setValues({
                ...values,
                ...network
            });
            setShowForm(true);
        }
    }

    const handleDelete = async (networkId) => {
        if (!window.confirm('Are you sure you want to delete this network?')) {
            return;
        }

        try {
            const res = await deleteNetwork(networkId);
            if (res) {
                const currentList = networkList.filter(network => network.networkId !== networkId);
                setNetworkList(currentList);
            } else {
                setError('Failed to delete network');
            }
        } catch (err) {
            console.error("Failed to delete:", err);
            setError(err.message || 'Failed to delete network');
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            let res;
            if (values.id) {
                res = await editNetwork(values);
            } else {
                res = await addNetwork(values);
            }

            if (res) {
                await getNetworkList();
                handleClear();
            } else {
                setError('Failed to save network');
            }
        } catch (err) {
            console.error("Failed to save:", err);
            setError(err.message || 'Failed to save network');
        }
    }

    return (
        <div className="analytics-network">
            <div className="network-header">
                <h2 className="network-title">Manage Network</h2>
                <div className="header-actions">
                    <button
                        className={`refresh-btn ${loading ? 'loading' : ''}`}
                        onClick={getNetworkList}
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
                            Add Network
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
                        <h3>{values.id ? 'Edit Network' : 'Add New Network'}</h3>
                        <button className="close-btn" onClick={handleClear}>
                            <X size={20} />
                        </button>
                    </div>
                    <form className="network-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="networkId">Network ID *</label>
                            <input
                                type="text"
                                id="networkId"
                                name="networkId"
                                value={values.networkId}
                                placeholder="Enter network id"
                                onChange={handleChange}
                                disabled={!!values.id}
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="rpcUrl">RPC Url *</label>
                            <input
                                type="text"
                                id="rpcUrl"
                                name="rpcUrl"
                                value={values.rpcUrl}
                                placeholder="Enter rpc url"
                                onChange={handleChange}
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="websocketUrl">Websocket Url *</label>
                            <input
                                type="text"
                                id="websocketUrl"
                                name="websocketUrl"
                                value={values.websocketUrl}
                                placeholder="Enter websocket url"
                                onChange={handleChange}
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="switch-label">
                                <span>Subscribed *</span>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        name="subscribed"
                                        checked={values.subscribed}
                                        onChange={(e) => {
                                            setValues((prev) => ({ ...prev, subscribed: e.target.checked }));
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

            <div className="network-table-container">
                <div className="table-wrapper">
                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>Loading networks...</p>
                        </div>
                    ) : (
                        <table className="network-table">
                            <thead>
                                <tr>
                                    <th className="table-header">ID</th>
                                    <th className="table-header">Network ID</th>
                                    <th className="table-header">RPC Url</th>
                                    <th className="table-header">Websocket Url</th>
                                    <th className="table-header">Subscribed</th>
                                    <th className="table-header">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {networkList?.length > 0 ? (
                                    networkList.map((network, index) => (
                                        <TableRow
                                            key={`${network.networkId}-${index}`}
                                            {...network}
                                            onEdit={handleEditClick}
                                            onDelete={handleDelete}
                                        />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="table-empty">
                                            No networks found
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

export default BlockMonitoringNetwork;

