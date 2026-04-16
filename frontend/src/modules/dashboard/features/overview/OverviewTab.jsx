// frontend/src/modules/dashboard/features/overview/OverviewTab.jsx
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import AnalyticsTab from './components/AnalyticsTab';
import SubmissionsTab from './components/SubmissionsTab';
import { BarChart2, MessageCircle, TrendingUp } from 'lucide-react';

const OverviewTab = ({ siteData, onSavingChange, onGoToOrders }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeSubTab = searchParams.get('overviewTab') || 'analytics';
    const handleTabChange = (tabName) => {
        setSearchParams(prev => {
            prev.set('overviewTab', tabName);
            prev.delete('submissionId');
            return prev;
        });
    };
    
    return (
        <div className="h-full flex flex-col gap-6 overflow-hidden pb-5 box-border">
            <div className="overview-header-container px-1">
                <div className="overview-header-left"></div>
                
                <div className="overview-header-center">
                    <h2 className="text-2xl font-semibold m-0 text-(--platform-text-primary) flex items-center justify-center gap-2.5 text-center">
                        <BarChart2 size={28} className="shrink-0" />
                        Огляд аналітики і звернень
                    </h2>
                </div>
                
                <div className="overview-header-right">
                    <nav className="editor-tabs custom-scrollbar">
                        <button
                            className={`tab-btn ${activeSubTab === 'analytics' ? 'active' : ''}`}
                            onClick={() => handleTabChange('analytics')}
                        >
                            <span className="tab-icon"><TrendingUp size={16} /></span>
                            <span className="tab-text">Аналітика</span>
                        </button>
                        <button
                            className={`tab-btn ${activeSubTab === 'crm' ? 'active' : ''}`}
                            onClick={() => handleTabChange('crm')}
                        >
                            <span className="tab-icon"><MessageCircle size={16} /></span>
                            <span className="tab-text">Звернення</span>
                        </button>
                    </nav>
                </div>
            </div>

            <div className="flex-1 min-h-0 relative">
                {activeSubTab === 'analytics' && (
                    <div className="h-full overflow-y-auto custom-scrollbar px-1 pb-4">
                        <AnalyticsTab 
                            siteData={siteData} 
                            onGoToOrders={onGoToOrders} 
                        />
                    </div>
                )}
                {activeSubTab === 'crm' && (
                    <SubmissionsTab 
                        siteId={siteData.id} 
                        onSavingChange={onSavingChange} 
                    />
                )}
            </div>

            <style>{`
                .overview-header-container {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                    flex-shrink: 0;
                    width: 100%;
                }
                .overview-header-left {
                    flex: 1 1 0%;
                    min-width: 0;
                }
                .overview-header-center {
                    flex: 0 1 auto;
                    display: flex;
                    justify-content: center;
                    min-width: 0;
                }
                .overview-header-right {
                    flex: 1 1 0%;
                    display: flex;
                    justify-content: flex-end;
                    min-width: 0;
                }
                .editor-tabs { 
                    display: flex; 
                    background: var(--platform-bg); 
                    padding: 4px; 
                    border-radius: 8px; 
                    gap: 4px; 
                    border: 1px solid var(--platform-border-color); 
                    overflow-x: auto;
                    max-width: 100%;
                }
                .tab-btn { 
                    padding: 8px 16px; 
                    font-size: 14px; 
                    font-weight: 500; 
                    border-radius: 6px; 
                    color: var(--platform-text-secondary); 
                    border: none; 
                    background: transparent; 
                    cursor: pointer; 
                    transition: all 0.2s ease; 
                    white-space: nowrap; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    gap: 8px; 
                    min-height: 36px; 
                }
                .tab-btn:hover { 
                    color: var(--platform-text-primary); 
                    background: var(--platform-hover-bg); 
                }
                .tab-btn.active { 
                    background: var(--platform-card-bg); 
                    color: var(--platform-accent); 
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); 
                    font-weight: 600; 
                }
                .tab-icon { 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    width: 18px; 
                    height: 18px; 
                }
                .tab-icon svg { 
                    width: 100%; 
                    height: 100%; 
                    fill: none; 
                    stroke: currentColor; 
                    stroke-width: 2; 
                    stroke-linecap: round; 
                    stroke-linejoin: round; 
                }
                .tab-text { 
                    font-weight: 500; 
                }

                @media (max-width: 1150px) {
                    .overview-header-container {
                        flex-direction: column;
                        gap: 16px;
                    }
                    .overview-header-left {
                        display: none;
                    }
                    .overview-header-right {
                        width: 100%;
                        justify-content: center;
                    }
                    .editor-tabs {
                        width: max-content;
                        justify-content: center;
                    }
                }

                @media (max-width: 768px) { 
                    .tab-btn { padding: 6px 10px; font-size: 13px; } 
                }

                @media (max-width: 600px) {
                    .overview-header-container { gap: 12px; }
                    .overview-header-center h2 { font-size: 1.25rem; }
                    .editor-tabs {
                        width: 100%;
                        justify-content: flex-start;
                    }
                }

                @media (max-width: 480px) { 
                    .tab-btn { padding: 4px 8px; font-size: 12px; } 
                    .tab-icon { width: 16px; height: 16px; } 
                }
            `}</style>
        </div>
    );
};

export default OverviewTab;