import React, { useState } from 'react';

const defaultData = {
  customerName: '',
  itemName: '',
  metal: '',
  grossWeight: '',
  stones: [{ name: '', weight: '', quantity: '', price: '' }],
  price: '',
  internalCost: '',
};

const ProductEntryForm = ({ mode = 'salesperson', initialData = defaultData, onSave }) => {
  const [formData, setFormData] = useState(initialData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStoneChange = (index, field, value) => {
    const updatedStones = [...formData.stones];
    updatedStones[index][field] = value;
    setFormData((prev) => ({ ...prev, stones: updatedStones }));
  };

  const addStone = () => {
    setFormData((prev) => ({
      ...prev,
      stones: [...prev.stones, { name: '', weight: '', quantity: '', price: '' }],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>{mode === 'salesperson' ? 'Sales Entry Form' : 'Customer Copy Form'}</h2>

      <input
        name="customerName"
        value={formData.customerName}
        onChange={handleChange}
        placeholder="Customer Name"
      /><br />

      <input name="itemName" value={formData.itemName} onChange={handleChange} placeholder="Item Name" /><br />

      <input name="metal" value={formData.metal} onChange={handleChange} placeholder="Metal" /><br />

      <input
        name="grossWeight"
        value={formData.grossWeight}
        onChange={handleChange}
        placeholder="Gross Weight"
      /><br />

      <h4>Stones:</h4>
      {formData.stones.map((stone, i) => (
        <div key={i}>
          <input
            value={stone.name}
            onChange={(e) => handleStoneChange(i, 'name', e.target.value)}
            placeholder="Stone Name"
          />
          <input
            value={stone.weight}
            onChange={(e) => handleStoneChange(i, 'weight', e.target.value)}
            placeholder="Weight"
          />
          <input
            value={stone.quantity}
            onChange={(e) => handleStoneChange(i, 'quantity', e.target.value)}
            placeholder="Quantity"
          />
          <input
            value={stone.price}
            onChange={(e) => handleStoneChange(i, 'price', e.target.value)}
            placeholder="Price"
          />
        </div>
      ))}

      <button type="button" onClick={addStone}>
        Add Stone
      </button><br />

      <input name="price" value={formData.price} onChange={handleChange} placeholder="Total Price" /><br />

      {mode === 'salesperson' && (
        <input
          name="internalCost"
          value={formData.internalCost}
          onChange={handleChange}
          placeholder="Internal Cost"
        />
      )}<br />

      <button type="submit">Save</button>
    </form>
  );
};

export default ProductEntryForm;