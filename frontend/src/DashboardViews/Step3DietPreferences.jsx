import { TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

export default function Step3DietPreferences({ formData, handleChange }) {
  return (
    <>
      <h5 className="mb-3 text-success">3. Dietary Preferences</h5>

      {/* Diet Type */}
      <FormControl fullWidth margin="normal">
        <InputLabel>Diet Type</InputLabel>
        <Select
          value={formData.dietType}
          onChange={(e) => handleChange('dietType', e.target.value)}
        >
          <MenuItem value="Vegetarian">Vegetarian</MenuItem>
          <MenuItem value="Non-Vegetarian">Non-Vegetarian</MenuItem>
        </Select>
      </FormControl>

      {/* Cultural Food Preference */}
      {/*<TextField
        fullWidth
        margin="normal"
        label="Allergies"
        value={formData.culturalPreference}
        onChange={(e) => handleChange('culturalPreference', e.target.value)}
      />*/}

      <TextField
      select
      fullWidth
      margin="normal"
      label="Allergies"
      value={formData.allergies}
      onChange={(e) => handleChange('allergies', e.target.value)}
    >
      <MenuItem value="None">None</MenuItem>
      <MenuItem value="Peanuts">Peanuts</MenuItem>
      <MenuItem value="Tree Nuts (Almonds, Cashews, Walnuts, etc.)">
        Tree Nuts (Almonds, Cashews, Walnuts, etc.)
      </MenuItem>
      <MenuItem value="Milk / Dairy">Milk / Dairy</MenuItem>
      <MenuItem value="Eggs">Eggs</MenuItem>
      <MenuItem value="Fish">Fish</MenuItem>
      <MenuItem value="Shellfish">Shellfish</MenuItem>
      <MenuItem value="Other">Other</MenuItem>
    </TextField>

      {/* Religious Restrictions Dropdown */}
      <FormControl fullWidth margin="normal">
        <InputLabel>Religious Restrictions</InputLabel>
        <Select
          value={formData.religiousRestrictions}
          onChange={(e) => handleChange('religiousRestrictions', e.target.value)}
        >
          <MenuItem value="Islam">Islam</MenuItem>
          <MenuItem value="Christianity">Christianity</MenuItem>
        </Select>
      </FormControl>

      {/* Disliked Foods */}
      <TextField
        fullWidth
        margin="normal"
        label="Disliked Foods"
        value={formData.dislikedFoods}
        onChange={(e) => handleChange('dislikedFoods', e.target.value)}
      />
    </>
  );
}
