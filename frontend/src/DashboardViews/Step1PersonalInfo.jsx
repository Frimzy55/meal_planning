import { useEffect } from 'react';
import { TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

export default function Step1PersonalInfo({ formData, handleChange }) {
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user?.id && !formData.id) {
      handleChange('id', user.id);
    }

    // ✅ Auto-fill full name using correct keys
    if (user?.firstName && user?.lastName && !formData.fullName) {
      handleChange('fullName', `${user.firstName} ${user.lastName}`);
    }
  }, [user, formData.id, formData.fullName, handleChange]);

  // ✅ Helper to ensure only numbers are saved
  const handleNumericChange = (field, value) => {
    if (/^\d*$/.test(value)) {
      handleChange(field, value);
    }
  };

  return (
    <>
      <h5 className="mb-3 text-success">1. Personal Info Section</h5>

      {/* hidden ID */}
      <TextField
        type="hidden"
        fullWidth
        margin="normal"
        label="ID"
        value={formData.id || ''}
        onChange={(e) => handleChange('id', e.target.value)}
      />

      {/* ✅ Auto-filled full name (read-only) */}
      <TextField
        fullWidth
        margin="normal"
        label="Full Name"
        value={formData.fullName || ''}
        InputProps={{
          readOnly: true, // 🔒 user cannot edit
        }}
      />

      {/* ✅ Age (numbers only) */}
      <TextField
        fullWidth
        margin="normal"
        label="Age"
        type="text"
        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
        value={formData.age || ''}
        onChange={(e) => handleNumericChange('age', e.target.value)}
      />

      <FormControl fullWidth margin="normal">
        <InputLabel>Gender</InputLabel>
        <Select
          value={formData.gender || ''}
          onChange={(e) => handleChange('gender', e.target.value)}
        >
          <MenuItem value="Male">Male</MenuItem>
          <MenuItem value="Female">Female</MenuItem>
          <MenuItem value="Other">Other</MenuItem>
        </Select>
      </FormControl>

      {/* ✅ Height (numbers only) */}
      <TextField
        fullWidth
        margin="normal"
        label="Height (cm)"
        type="text"
        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
        value={formData.height || ''}
        onChange={(e) => handleNumericChange('height', e.target.value)}
      />

      {/* ✅ Weight (numbers only) */}
      <TextField
        fullWidth
        margin="normal"
        label="Weight (kg)"
        type="text"
        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
        value={formData.weight || ''}
        onChange={(e) => handleNumericChange('weight', e.target.value)}
      />
    </>
  );
}
