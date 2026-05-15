// frontend/src/shared/ui/complex/TemplateFilters.jsx
import React from 'react';
import { Input } from '../elements/Input';
import { Button } from '../elements/Button';
import CategoryTabs from './CategoryTabs';
import { Search } from 'lucide-react';

const TemplateFilters = ({ filters, isAdmin, hideSourceTabs = false, compact = false }) => {
    const {
        templateSourceTab, setTemplateSourceTab,
        activeSystemTab, setActiveSystemTab,
        ownershipFilter, setOwnershipFilter,
        searchQuery, setSearchQuery,
        selectedCategory, setSelectedCategory
    } = filters;
    
    return (
        <div className="flex flex-col gap-3">
            {!isAdmin && !hideSourceTabs && (
                <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                    <Button variant={templateSourceTab === 'system' ? 'primary' : 'outline'} size="sm" className="flex-1 justify-center px-0 min-w-25" onClick={() => setTemplateSourceTab('system')} title="Системні">
                        {!compact && <span className="truncate">Системні</span>}
                    </Button>
                    <Button variant={templateSourceTab === 'personal' ? 'primary' : 'outline'} size="sm" className="flex-1 justify-center px-0 min-w-25" onClick={() => setTemplateSourceTab('personal')} title="Мої шаблони">
                        {!compact && <span className="truncate">Мої шаблони</span>}
                    </Button>
                </div>
            )}
            {isAdmin && templateSourceTab === 'system' && (
                <div className="flex gap-2 flex-wrap">
                    <div className="flex bg-(--platform-bg) p-1 rounded-lg border border-(--platform-border-color) flex-1 min-w-70">
                        <button onClick={() => setActiveSystemTab('all')} className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-md transition-all ${activeSystemTab === 'all' ? 'bg-(--platform-card-bg) text-(--platform-text-primary) shadow-sm' : 'text-(--platform-text-secondary) hover:text-(--platform-text-primary)'}`} title="Всі шаблони">
                            Всі
                        </button>
                        <button onClick={() => setActiveSystemTab('drafts')} className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-md transition-all ${activeSystemTab === 'drafts' ? 'bg-(--platform-card-bg) text-orange-500 shadow-sm' : 'text-(--platform-text-secondary) hover:text-orange-500'}`} title="Чернетки">
                            Чернетки
                        </button>
                        <button onClick={() => setActiveSystemTab('staging')} className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-md transition-all ${activeSystemTab === 'staging' ? 'bg-(--platform-card-bg) text-blue-500 shadow-sm' : 'text-(--platform-text-secondary) hover:text-blue-500'}`} title="На перевірці">
                            На перевірці
                        </button>
                        <button onClick={() => setActiveSystemTab('public')} className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-md transition-all ${activeSystemTab === 'public' ? 'bg-(--platform-card-bg) text-green-500 shadow-sm' : 'text-(--platform-text-secondary) hover:text-green-500'}`} title="Публічні">
                            Публічні
                        </button>
                    </div>
                    <div className="flex bg-(--platform-bg) p-1 rounded-lg border border-(--platform-border-color) shrink-0 flex-1 min-w-40">
                        <button onClick={() => setOwnershipFilter('all')} className={`flex-1 px-2.5 py-1.5 flex items-center justify-center gap-1.5 text-xs font-medium rounded-md transition-all ${ownershipFilter === 'all' ? 'bg-(--platform-card-bg) text-(--platform-text-primary) shadow-sm' : 'text-(--platform-text-secondary) hover:text-(--platform-text-primary)'}`} title="Всі автори">
                            Всі
                        </button>
                        <button onClick={() => setOwnershipFilter('mine')} className={`flex-1 px-2.5 py-1.5 flex items-center justify-center gap-1.5 text-xs font-medium rounded-md transition-all ${ownershipFilter === 'mine' ? 'bg-(--platform-card-bg) text-indigo-500 shadow-sm' : 'text-(--platform-text-secondary) hover:text-indigo-500'}`} title="Власні">
                            Власні
                        </button>
                        <button onClick={() => setOwnershipFilter('others')} className={`flex-1 px-2.5 py-1.5 flex items-center justify-center gap-1.5 text-xs font-medium rounded-md transition-all ${ownershipFilter === 'others' ? 'bg-(--platform-card-bg) text-gray-500 shadow-sm' : 'text-(--platform-text-secondary) hover:text-gray-500'}`} title="Від інших">
                            Інші
                        </button>
                    </div>
                </div>
            )}
            <Input placeholder="Пошук..." leftIcon={<Search size={16} />} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} wrapperStyle={{ marginBottom: 0 }} />
            <CategoryTabs selectedCategory={selectedCategory} onSelect={setSelectedCategory} />
        </div>
    );
};

export default TemplateFilters;