import { useEffect } from 'react';
import { TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

export default function Step1PersonalInfo({ formData, handleChange }) {
  const user = JSON.parse(localStorage.getItem('user'));

  // Auto-fill only once when component mounts
  useEffect(() => {
    if (user?.id && !formData.id) {
      handleChange('id', user.id);
    }
  }, [user, formData.id, handleChange]);

  return (
    <>
      <h5 className="mb-3 text-success">1. Personal Info Section</h5>

     {/* ✅ Auto-filled weight field with user.id */}
      <TextField
       type="hidden"
        fullWidth
        margin="normal"
        label="ID "
        value={formData.id}
        onChange={(e) => handleChange('id', e.target.value)}
      />


      <TextField
        fullWidth
        margin="normal"
        label="Full Name"
        value={formData.fullName}
        onChange={(e) => handleChange('fullName', e.target.value)}
      />

      <TextField
        fullWidth
        margin="normal"
        label="Age"
        type="number"
        value={formData.age}
        onChange={(e) => handleChange('age', e.target.value)}
      />

      <FormControl fullWidth margin="normal">
        <InputLabel>Gender</InputLabel>
        <Select
          value={formData.gender}
          onChange={(e) => handleChange('gender', e.target.value)}
        >
          <MenuItem value="Male">Male</MenuItem>
          <MenuItem value="Female">Female</MenuItem>
          <MenuItem value="Other">Other</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        margin="normal"
        label="Height (cm)"
        value={formData.height}
        onChange={(e) => handleChange('height', e.target.value)}
      />


      <TextField
        fullWidth
        margin="normal"
        label="weight (cm)"
        value={formData.weight}
        onChange={(e) => handleChange('weight', e.target.value)}
      />

      
    </>
  );
}
