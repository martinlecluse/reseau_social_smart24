import mongoose, { Schema, Types, Document } from 'mongoose';
import { IPost, Post } from '../post';

export interface IAlgoSuggestionOther {
    item: Types.ObjectId;
    weight: number;
}

export interface IAlgoSuggestion {
    user: Types.ObjectId;
    others: IAlgoSuggestionOther[];
}

export interface IAlgoParams {
    rateFactChecked: number,
    rateDiversification: number
}

const AlgoSuggestionOtherSchema = new Schema<IAlgoSuggestionOther>({
    item: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    weight: { type: Number, required: true },
});

const AlgoSuggestionSchema = new Schema<IAlgoSuggestion>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    others: [AlgoSuggestionOtherSchema],
});

export const AlgoSuggestion = mongoose.model<IAlgoSuggestion>('algo-suggestion', AlgoSuggestionSchema);
