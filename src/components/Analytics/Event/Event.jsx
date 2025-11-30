import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle, Edit2, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import ReactPaginate from 'react-paginate';
import { addEvent, deleteEvent, editEvent, fetchContractList, fetchEventList } from '../../../services/blockMonitoringServices';
import './Event.css';

const TableRow = ({ id, address, event, onEdit, onDelete }) => {
    return (
        <tr className="table-row">
            <td className="table-cell">
                <span className="cell-content">{id}</span>
            </td>
            <td className="table-cell">
                <span className="cell-content address-cell">{address || '-'}</span>
            </td>
            <td className="table-cell">
                <span className="cell-content event-cell">{event || '-'}</span>
            </td>
            <td className="table-cell actions-cell">
                <button 
                    className="action-btn edit-btn" 
                    onClick={() => onEdit(id)}
                    title="Edit"
                >
                    <Edit2 size={16} />
                </button>
                <button 
                    className="action-btn delete-btn" 
                    onClick={() => onDelete(id)}
                    title="Delete"
                >
                    <Trash2 size={16} />
                </button>
            </td>
        </tr>
    );
}

const BlockMonitoringEvent = () => {
    const [contractList, setContractList] = useState([]);
    const [eventList, setEventList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [values, setValues] = useState({
        address: '',
        event: '',
    });

    const limit = 5;
    const [skip, setSkip] = useState(0);
    const [pageCount, setPageCount] = useState(0);

    const handleChange = (e) => {
        setErrorMsg('');
        setError(null);
        setValues({
            ...values,
            [e.target.name]: e.target.value,
        });
    }

    const handleClear = () => {
        setValues({
            address: '',
            event: '',
        });
        setErrorMsg('');
        setError(null);
        setShowForm(false);
    }

    useEffect(() => {
        getContractList();
    }, []);

    useEffect(() => {
        getEventList({ limit, skip });
    }, [skip, limit]);

    const getEventList = async (payload) => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetchEventList(payload);
            if (res) {
                setEventList(res.rows || []);
                setPageCount(Math.ceil((res.count || 0) / limit));
            } else {
                setError('Failed to fetch event list');
            }
        } catch (err) {
            console.error("Failed to get event list:", err);
            setError(err.message || 'Failed to fetch event list');
        } finally {
            setLoading(false);
        }
    }

    const getContractList = async () => {
        try {
            const res = await fetchContractList();
            if (res) {
                setContractList(res);
            }
        } catch (err) {
            console.error("Failed to get contract list:", err);
        }
    }

    const handleEditClick = (id) => {
        setErrorMsg('');
        setError(null);
        const event = eventList.find(event => event.id === id);
        if (event) {
            setValues({
                ...values,
                ...event
            });
            setShowForm(true);
        }
    }

    const handlePageClick = async (event) => {
        setErrorMsg('');
        setError(null);
        const newOffset = (event.selected * limit) % (pageCount * limit);
        setSkip(newOffset);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this event?')) {
            return;
        }

        try {
            setErrorMsg('');
            setError(null);
            const res = await deleteEvent(id);
            if (res) {
                const currentList = eventList.filter(event => event.id !== id);
                setEventList(currentList);
                // Refresh the list to update pagination
                await getEventList({ limit, skip });
            } else {
                setError('Failed to delete event');
            }
        } catch (err) {
            console.error("Failed to delete:", err);
            setError(err.message || 'Failed to delete event');
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setError(null);

        try {
            let res;
            if (values.id) {
                res = await editEvent(values);
            } else {
                res = await addEvent(values);
            }

            if (res) {
                await getEventList({ limit, skip });
                handleClear();
            } else {
                setErrorMsg('Failed to save event');
            }
        } catch (error) {
            const errorMessage = error?.message || error?.response?.data?.message || 'Failed to save event';
            setErrorMsg(errorMessage);
            setError(errorMessage);
        }
    }

    return (
        <div className="analytics-event">
            <div className="event-header">
                <h2 className="event-title">Manage Event</h2>
                <div className="header-actions">
                    <button
                        className={`refresh-btn ${loading ? 'loading' : ''}`}
                        onClick={() => getEventList({ limit, skip })}
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
                            Add Event
                        </button>
                    )}
                </div>
            </div>

            {(error || errorMsg) && (
                <div className="error-banner">
                    <AlertCircle size={18} />
                    <span>{errorMsg || error}</span>
                </div>
            )}

            {showForm && (
                <div className="form-container">
                    <div className="form-header">
                        <h3>{values.id ? 'Edit Event' : 'Add New Event'}</h3>
                        <button className="close-btn" onClick={handleClear}>
                            <X size={20} />
                        </button>
                    </div>
                    <form className="event-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="address">Contract *</label>
                            <select
                                id="address"
                                name="address"
                                value={values.address}
                                onChange={handleChange}
                                required
                                className="form-select"
                            >
                                <option value="">Select contract</option>
                                {contractList.map((contract) => (
                                    <option key={contract.address} value={contract.address}>
                                        {contract.address} ({contract.networkId})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="event">Event Name *</label>
                            <input
                                type="text"
                                id="event"
                                name="event"
                                value={values.event}
                                placeholder="Enter event name"
                                onChange={handleChange}
                                required
                                className="form-input"
                            />
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

            <div className="event-table-container">
                <div className="table-wrapper">
                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>Loading events...</p>
                        </div>
                    ) : (
                        <table className="event-table">
                            <thead>
                                <tr>
                                    <th className="table-header">ID</th>
                                    <th className="table-header">Address</th>
                                    <th className="table-header">Event</th>
                                    <th className="table-header">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {eventList?.length > 0 ? (
                                    eventList.map((eventItem, index) => (
                                        <TableRow
                                            key={`${eventItem.id}-${index}`}
                                            {...eventItem}
                                            onEdit={handleEditClick}
                                            onDelete={handleDelete}
                                        />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="table-empty">
                                            No events found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

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
        </div>
    );
}

export default BlockMonitoringEvent;

