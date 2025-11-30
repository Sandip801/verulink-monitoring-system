import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { fetchBlockOverviewList } from '../../../services/blockMonitoringServices';
import './Overview.css';

const TableRow = ({ networkId, dbBlock, chainBlock }) => {
    return (
        <tr className="table-row">
            <td className="table-cell">
                <span className="cell-content">
                    {networkId}
                </span>
            </td>
            <td className="table-cell">
                <span className="cell-content">
                    {dbBlock || '-'}
                </span>
            </td>
            <td className="table-cell">
                <span className="cell-content">
                    {chainBlock || '-'}
                </span>
            </td>
        </tr>
    );
}

const BlockMonitoringOverview = () => {
    const [blockOverviewList, setBlockOverviewList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const getBlockOverviewList = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await fetchBlockOverviewList();
            setBlockOverviewList(result || []);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to fetch block overview');
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        getBlockOverviewList();
    }, []);

    return (
        <div className="analytics-overview">
            <div className="overview-header">
                <h2 className="overview-title">Block Overview</h2>
                <button
                    className={`refresh-btn ${isLoading ? 'loading' : ''}`}
                    onClick={getBlockOverviewList}
                    disabled={isLoading}
                    title="Refresh data"
                >
                    <RefreshCw size={18} className={isLoading ? 'spinning' : ''} />
                    <span>Refresh</span>
                </button>
            </div>

            {error && (
                <div className="error-banner">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            <div className="overview-table-container">
                <div className="table-wrapper">
                    {isLoading ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>Loading block overview...</p>
                        </div>
                    ) : (
                        <table className="overview-table">
                            <thead>
                                <tr>
                                    <th className="table-header">Network ID</th>
                                    <th className="table-header">Blocks(DB)</th>
                                    <th className="table-header">Blocks(Chain)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {blockOverviewList?.length > 0 ? (
                                    blockOverviewList.map((blockOverview, index) => (
                                        <TableRow
                                            key={`${blockOverview.networkId}-${index}`}
                                            {...blockOverview}
                                        />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="table-empty">
                                            No records found
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

export default BlockMonitoringOverview;

