import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

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
            const response = await fetch('http://localhost:3000/api/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                navigate('/');
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

            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
                <div className="card space-y-4">
                    <div>
                        <label className="text-label block mb-2">Campaign Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full bg-[#121212] border border-[#232626] rounded p-2 text-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-label block mb-2">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full bg-[#121212] border border-[#232626] rounded p-2 text-white h-32"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-label block mb-2">Budget Limit ($)</label>
                            <input
                                type="number"
                                name="budget"
                                value={formData.budget}
                                onChange={handleChange}
                                className="w-full bg-[#121212] border border-[#232626] rounded p-2 text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-label block mb-2">Bidding Process Ends</label>
                            <input
                                type="datetime-local"
                                name="deadline"
                                value={formData.deadline || ''}
                                onChange={handleChange}
                                className="w-full bg-[#121212] border border-[#232626] rounded p-2 text-white"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="card space-y-4">
                    <h2 className="text-section-header">Product Details</h2>

                    <div>
                        <label className="text-label block mb-2">Product Name</label>
                        <input
                            type="text"
                            name="productName"
                            value={formData.productName}
                            onChange={handleChange}
                            className="w-full bg-[#121212] border border-[#232626] rounded p-2 text-white"
                        />
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

                <button
                    type="submit"
                    className="w-full bg-accent text-black font-bold py-3 rounded-lg hover:opacity-90 transition-opacity"
                >
                    Post Campaign
                </button>
            </form>
        </div>
    );
};

export default CreateCampaign;
