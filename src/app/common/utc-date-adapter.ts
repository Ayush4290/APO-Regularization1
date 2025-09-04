import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment';
import { Injectable } from '@angular/core';

@Injectable()
export class UtcMomentDateAdapter extends MomentDateAdapter {
    // Override to handle dates correctly in UTC
    override  deserialize(value: any): moment.Moment | null {
        if (value) {
            // Assuming incoming value is a valid ISO 8601 string
            const date = moment.utc(value);
            return date.isValid() ? date : super.deserialize(value);
        }
        return super.deserialize(value);
    }

    // Override to always create dates at UTC midnight
    override createDate(year: number, month: number, date: number): moment.Moment {
        return moment.utc({ year, month, date });
    }
}