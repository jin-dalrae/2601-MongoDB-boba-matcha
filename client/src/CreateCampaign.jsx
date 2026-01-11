import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { apiFetch } from './apiClient';

const CreateCampaign = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        budget: '',
        duration: '',
        productName: '',
        shipProduct: false,
        keepProduct: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await apiFetch('/api/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                navigate('/advertiser/campaigns');
            } else {
                console.error('Failed to create campaign');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="p-4 page-container">
            <div className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="mr-4 text-muted">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-page-title text-accent">Create New Campaign</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="card space-y-4">
                    <div className="form-grid">
                        <div>
                            <label className="text-label block mb-2">Campaign Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="input-control"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-label block mb-2">Budget Limit ($)</label>
                            <input
                                type="number"
                                name="budget"
                                value={formData.budget}
                                onChange={handleChange}
                                className="input-control"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-label block mb-2">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="textarea-control"
                            required
                        />
                    </div>

                    <div className="form-grid">
                        <div>
                            <label className="text-label block mb-2">Bidding Process Ends</label>
                            <input
                                type="datetime-local"
                                name="deadline"
                                value={formData.deadline || ''}
                                onChange={handleChange}
                                className="input-control"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="card space-y-4">
                    <h2 className="text-section-header">Product Details</h2>

                    <div className="form-grid">
                        <div>
                            <label className="text-label block mb-2">Product Name</label>
                            <input
                                type="text"
                                name="productName"
                                value={formData.productName}
                                onChange={handleChange}
                                className="input-control"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-2 border border-[#232626] rounded">
                        <span className="text-label">Ship Product to Creator?</span>
                        <input
                            type="checkbox"
                            name="shipProduct"
                            checked={formData.shipProduct}
                            onChange={handleChange}
                            className="accent-accent w-5 h-5"
                        />
                    </div>

                    <div className="flex items-center justify-between p-2 border border-[#232626] rounded">
                        <span className="text-label">Creator keeps product?</span>
                        <input
                            type="checkbox"
                            name="keepProduct"
                            checked={formData.keepProduct}
                            onChange={handleChange}
                            className="accent-accent w-5 h-5"
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="submit"
                        className="btn"
                    >
                        Post Campaign
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateCampaign;
