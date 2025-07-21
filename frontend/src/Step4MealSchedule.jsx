import { TextField } from '@mui/material';

export default function Step4MealSchedule({ formData, handleChange, handleNestedChange }) {
  return (
    <>
      <h5 className="mb-3 text-success">4. Meal Schedule Preferences</h5>
      <TextField fullWidth margin="normal" label="Meals per Day" type="number" value={formData.mealsPerDay} onChange={(e) => handleChange('mealsPerDay', e.target.value)} />
      <TextField fullWidth margin="normal" label="Breakfast Time" type="time" value={formData.mealTimes.breakfast} onChange={(e) => handleNestedChange('mealTimes', 'breakfast', e.target.value)} />
      <TextField fullWidth margin="normal" label="Lunch Time" type="time" value={formData.mealTimes.lunch} onChange={(e) => handleNestedChange('mealTimes', 'lunch', e.target.value)} />
      <TextField fullWidth margin="normal" label="Dinner Time" type="time" value={formData.mealTimes.dinner} onChange={(e) => handleNestedChange('mealTimes', 'dinner', e.target.value)} />
    </>
  );
}
