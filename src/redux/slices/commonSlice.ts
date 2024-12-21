import { PayloadAction } from '@reduxjs/toolkit';
import { createAppSlice } from './appSlice';

export interface CommonState {
    isDialogOpen: boolean;
}

const initialState: CommonState = {
    isDialogOpen: false,
};

const commonSlice = createAppSlice({
    name: 'common',
    initialState,
    reducers: {
        setDialogOpen: (state, action: PayloadAction<boolean>) => {
            state.isDialogOpen = action.payload;
        },
    }
});

export const { setDialogOpen } = commonSlice.actions;

export default commonSlice.reducer;