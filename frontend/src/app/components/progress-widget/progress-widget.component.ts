import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DateTime } from 'luxon';

import { Month } from '../../models/month';

const NEW_MONTH_OFFSET = 15;
const NEW_WEEK_OFFSET = 10;

@Component({
  selector: 'app-progress-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-widget.component.html',
  styleUrl: './progress-widget.component.css'
})
export class ProgressWidgetComponent {
  data!: Month[];

  ngOnInit() {
    this.data = this.create_dummy_data()
  }

  create_dummy_data(): Month[] {
    let data: Month[] = [];

    let now: DateTime = DateTime.local();
    let temp: DateTime = now.minus({year: 1});
    while (temp < now) {
      if (!data || temp.month !== data[data.length - 1].month) {
        data.push({
          month: temp.month,
          year: temp.year,
          days: []
        });
      }

      // data[data.length - 1][temp.day] = Math.floor(Math.random() * (5 + 1));
    }

    return data;
  }

  initialize_x() {
    return 0;
  }

  increment_x(x: number, temp: DateTime) {
    if (temp.day === 1) return x + NEW_MONTH_OFFSET;
    else if (temp.weekday === 1) return x + NEW_WEEK_OFFSET;
    else return x;
  }

  initialize_date(): DateTime {
    return DateTime.local().minus({year: 1});
  }

  increment_date(date: DateTime): DateTime {
    return date.plus({days: 1});
  }
}
