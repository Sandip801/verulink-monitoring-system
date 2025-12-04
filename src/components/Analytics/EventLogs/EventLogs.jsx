import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle, CheckCircle, Search, X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import ReactPaginate from 'react-paginate';
import { fetchContractList, fetchEventList, fetchEventLogsList, fetchNetworkList, mappingNetworkScan, syncMissingBlocks } from '../../../services/blockMonitoringServices';
import './EventLogs.css';

const EventLogCard = ({ 
    txnHash, 
    id, 
    event, 
    networkId, 
    blockNumber, 
    status, 
    address, 
    eventPayload, 
    webhookStatusCode, 
    webhookResponse,
    onSync,
    onSyncComplete
}) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const syncBlock = async (payload) => {
        try {
            setLoading(true);
            setMessage(null);
            await syncMissingBlocks(payload);
            setMessage({ 
                success: true, 
                message: 'Blocks synced successfully' 
            });
            if (onSyncComplete) {
                onSyncComplete();
            }
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

    const networkScan = mappingNetworkScan[networkId];
    const transactionUrl = networkScan ? `${networkScan.transaction}/${txnHash}` : null;
    const blockUrl = networkScan ? `${networkScan.block}/${blockNumber}` : null;
    const addressUrl = networkScan ? `${networkScan.address}/${address}` : null;
    const eventUrl = networkScan ? `${networkScan.transaction}/${txnHash}#eventlog` : null;

    return (
        <div className="event-log-card">
            <div className="event-log-content">
                <div className="event-log-row">
                    <span className="event-log-label">Network:</span>
                    <span className="event-log-value">{networkId}</span>
                </div>
                
                <div className="event-log-row">
                    <span className="event-log-label">Transaction:</span>
                    <span className="event-log-value">
                        {transactionUrl ? (
                            <a 
                                href={transactionUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="event-log-link"
                            >
                                {txnHash}
                                <ExternalLink size={14} className="link-icon" />
                            </a>
                        ) : (
                            txnHash
                        )}
                    </span>
                </div>
                
                <div className="event-log-row">
                    <span className="event-log-label">Block:</span>
                    <span className="event-log-value">
                        {blockUrl ? (
                            <a 
                                href={blockUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="event-log-link"
                            >
                                {blockNumber}
                                <ExternalLink size={14} className="link-icon" />
                            </a>
                        ) : (
                            blockNumber
                        )}
                    </span>
                </div>
                
                <div className="event-log-row">
                    <span className="event-log-label">Contract:</span>
                    <span className="event-log-value">
                        {addressUrl ? (
                            <a 
                                href={addressUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="event-log-link"
                            >
                                {address}
                                <ExternalLink size={14} className="link-icon" />
                            </a>
                        ) : (
                            address
                        )}
                    </span>
                </div>
                
                <div className="event-log-row">
                    <span className="event-log-label">Event:</span>
                    <span className="event-log-value">
                        {eventUrl ? (
                            <a 
                                href={eventUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="event-log-link"
                            >
                                {event}
                                <ExternalLink size={14} className="link-icon" />
                            </a>
                        ) : (
                            event
                        )}
                    </span>
                </div>
                
                <div className="event-log-row">
                    <span className="event-log-label">Payload:</span>
                    <code className="event-log-code">{eventPayload || '-'}</code>
                </div>
                
                <div className="event-log-row">
                    <span className="event-log-label">Synced:</span>
                    <span className={`status-badge ${status ? 'synced' : 'not-synced'}`}>
                        {status ? 'YES' : 'NO'}
                    </span>
                </div>
                
                <div className="event-log-row">
                    <span className="event-log-label">Webhook Status:</span>
                    <span className="event-log-value">{webhookStatusCode || '-'}</span>
                </div>
                
                <div className="event-log-row">
                    <span className="event-log-label">Webhook Response:</span>
                    <code className="event-log-code">{webhookResponse || '-'}</code>
                </div>
                
                {!status && (
                    <div className="event-log-sync">
                        <button
                            className="sync-btn"
                            onClick={() => syncBlock({ networkId, from: blockNumber, to: blockNumber })}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <RefreshCw size={16} className="spinning" />
                                    <span>Syncing...</span>
                                </>
                            ) : (
                                'Sync'
                            )}
                        </button>
                        {message && (
                            <div className={`sync-message ${message.success ? 'success' : 'error'}`}>
                                {message.message}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

const BlockMonitoringEventLogs = () => {
    const [eventLogsList, setEventLogsList] = useState([]);
    const [networkList, setNetworkList] = useState([]);
    const [eventList, setEventList] = useState([]);
    const [contractList, setContractList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [values, setValues] = useState({
        networkId: '',
        address: '',
        event: '',
        txnHash: '',
        status: '',
        fromBlockNumber: '',
        toBlockNumber: '',
    });

    const limit = 8;
    const [skip, setSkip] = useState(0);
    const [pageCount, setPageCount] = useState(0);

    const handleChange = (e) => {
        setValues({
            ...values,
            [e.target.name]: e.target.value,
        });
    }

    const setFieldValue = (key, value) => {
        setValues((prev) => ({ ...prev, [key]: value }));
    }

    const handleClear = async () => {
        setValues({
            networkId: '',
            address: '',
            event: '',
            txnHash: '',
            status: '',
            fromBlockNumber: '',
            toBlockNumber: '',
        });
        await getEventLogsList({ limit, skip: 0 });
        setSkip(0);
    }

    useEffect(() => {
        getNetworkList();
    }, []);

    useEffect(() => {
        if (values.networkId) {
            getContractList({ networkId: values.networkId });
        } else {
            setContractList([]);
        }
    }, [values.networkId]);

    useEffect(() => {
        if (values.networkId && values.address) {
            getEventList({ address: values.address });
        } else {
            setEventList([]);
        }
    }, [values.address, values.networkId]);

    useEffect(() => {
        getEventLogsList({ limit, skip });
    }, [skip, limit]);

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

    const getEventList = async (payload) => {
        try {
            const res = await fetchEventList(payload);
            if (res) {
                setEventList(res.rows || []);
                setFieldValue('event', '');
            }
        } catch (err) {
            console.error("Failed to get event list:", err);
        }
    }

    const getContractList = async (payload) => {
        try {
            const res = await fetchContractList(payload);
            if (res) {
                setContractList(res);
                setFieldValue('address', '');
            }
        } catch (err) {
            console.error("Failed to get contract list:", err);
        }
    }

    const getEventLogsList = async (payload) => {
        try {
            setLoading(true);
            const res = await fetchEventLogsList(payload);
            if (res) {
                setEventLogsList(res.rows || []);
                setPageCount(Math.ceil((res.count || 0) / limit));
            }
        } catch (err) {
            console.error("Failed to get event logs list:", err);
        } finally {
            setLoading(false);
        }
    }

    const normalizeValue = (value) => {
        if (typeof value === "string") {
            return value.length > 0;
        }
        if (typeof value === "number") {
            return value !== null && value !== undefined && value !== '';
        }
        if (typeof value === "object") {
            if (Array.isArray(value)) {
                return value.length > 0;
            }
            return value !== null && value !== undefined;
        }
        return value !== null && value !== undefined && value !== '';
    }

    const handleSubmit = async (e) => {
        try {
            e?.preventDefault?.();
            const finalValues = Object.fromEntries(
                Object.entries(values).filter(([key, value]) => normalizeValue(value))
            );
            await getEventLogsList({ ...finalValues, limit, skip: 0 });
            setSkip(0);
        } catch (err) {
            console.error("Error", err);
        }
    }

    const handlePageClick = async (event) => {
        const newOffset = (event.selected * limit) % (pageCount * limit);
        setSkip(newOffset);
    };

    const handleSyncComplete = () => {
        // Refresh the list after sync
        const finalValues = Object.fromEntries(
            Object.entries(values).filter(([key, value]) => normalizeValue(value))
        );
        getEventLogsList({ ...finalValues, limit, skip });
    }

    return (
        <div className="analytics-event-logs">
            <div className="event-logs-header">
                <h2 className="event-logs-title">Event Logs</h2>
            </div>

            <div className="filter-container">
                <form className="event-logs-form" onSubmit={handleSubmit}>
                    <div className="filter-grid">
                        <div className="form-group">
                            <label htmlFor="networkId">Network</label>
                            <select
                                id="networkId"
                                name="networkId"
                                value={values.networkId}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="">Select Network</option>
                                {networkList.map((network) => (
                                    <option key={network.networkId} value={network.networkId}>
                                        {network.networkId}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="address">Contract</label>
                            <select
                                id="address"
                                name="address"
                                value={values.address}
                                onChange={handleChange}
                                className="form-select"
                                disabled={!values.networkId}
                            >
                                <option value="">Select Contract</option>
                                {contractList.map((contract) => (
                                    <option key={contract.address} value={contract.address}>
                                        {contract.address}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="event">Event</label>
                            <select
                                id="event"
                                name="event"
                                value={values.event}
                                onChange={handleChange}
                                className="form-select"
                                disabled={!values.address}
                            >
                                <option value="">Select Event</option>
                                {eventList.map((eventItem) => (
                                    <option key={eventItem.event} value={eventItem.event}>
                                        {eventItem.event}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="status">Synced</label>
                            <select
                                id="status"
                                name="status"
                                value={values.status}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="">Select status</option>
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="fromBlockNumber">Block From</label>
                            <input
                                type="number"
                                id="fromBlockNumber"
                                name="fromBlockNumber"
                                value={values.fromBlockNumber}
                                placeholder="Enter block number"
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="toBlockNumber">Block To</label>
                            <input
                                type="number"
                                id="toBlockNumber"
                                name="toBlockNumber"
                                value={values.toBlockNumber}
                                placeholder="Enter block number"
                                min={values.fromBlockNumber || 0}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="txnHash">Transaction Hash</label>
                            <input
                                type="text"
                                id="txnHash"
                                name="txnHash"
                                value={values.txnHash}
                                placeholder="Enter txn hash"
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="filter-actions">
                        <button type="submit" className="search-btn">
                            <Search size={18} />
                            <span>Search</span>
                        </button>
                        <button type="button" onClick={handleClear} className="clear-btn">
                            <X size={18} />
                            <span>Clear</span>
                        </button>
                    </div>
                </form>
            </div>

            {loading && eventLogsList.length === 0 ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading event logs...</p>
                </div>
            ) : (
                <>
                    {eventLogsList.length > 0 ? (
                        <div className="event-logs-grid">
                            {eventLogsList.map((result, index) => (
                                <EventLogCard
                                    key={`${result.id}-${index}`}
                                    {...result}
                                    onSyncComplete={handleSyncComplete}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>No event logs found</p>
                        </div>
                    )}

                    {pageCount > 1 && (
                        <div className="pagination-container">
                            <ReactPaginate
                                breakLabel="..."
                                nextLabel={<ChevronRight size={18} />}
                                onPageChange={handlePageClick}
                                pageRangeDisplayed={limit}
                                pageCount={pageCount}
                                previousLabel={<ChevronLeft size={18} />}
                                renderOnZeroPageCount={null}
                                containerClassName="pagination"
                                pageClassName="pagination-page"
                                pageLinkClassName="pagination-link"
                                previousClassName="pagination-nav"
                                previousLinkClassName="pagination-link"
                                nextClassName="pagination-nav"
                                nextLinkClassName="pagination-link"
                                breakClassName="pagination-break"
                                breakLinkClassName="pagination-link"
                                activeClassName="pagination-active"
                                disabledClassName="pagination-disabled"
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default BlockMonitoringEventLogs;

