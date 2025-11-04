import { TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

export default function Step3DietPreferences({ formData, handleChange }) {
  return (
    <>
      <h5 className="mb-3 text-success">3. Dietary Preferences</h5>
      <FormControl fullWidth margin="normal">
        <InputLabel>Diet Type</InputLabel>
        <Select value={formData.dietType} onChange={(e) => handleChange('dietType', e.target.value)}>
          <MenuItem value="Vegetarian">Vegetarian</MenuItem>
          <MenuItem value="Non-Vegetarian">Non-Vegetarian</MenuItem>
          
        </Select>
      </FormControl>
      <TextField fullWidth margin="normal" label="Cultural food Preference" value={formData.culturalPreference} onChange={(e) => handleChange('culturalPreference', e.target.value)} />
      <TextField fullWidth margin="normal" label="Religious Restrictions" value={formData.religiousRestrictions} onChange={(e) => handleChange('religiousRestrictions', e.target.value)} />
      <TextField fullWidth margin="normal" label="Disliked Foods" value={formData.dislikedFoods} onChange={(e) => handleChange('dislikedFoods', e.target.value)} />
    </>
  );
}
