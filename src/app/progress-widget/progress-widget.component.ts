import { Component, ElementRef, Input, ViewChild, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateTime } from 'luxon';
import { Duration } from '../custom-types'
import chroma from 'chroma-js'

@Component({
  selector: 'app-progress-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-widget.component.html',
  styleUrl: './progress-widget.component.css'
})
export class ProgressWidgetComponent {
  @Input() activity!: string;
  @Input() duration!: Duration;
  @Input() color!: string;
  @ViewChild('tooltip', { static: true }) tooltip!: ElementRef;
  constructor(private renderer: Renderer2) {}
  now: DateTime = DateTime.local();
  data: MonthActivity[] = [];
  total: number = 0;
  active: number = 0;
  streak: number = 0;
  goal: number = 5;

  todays_activity: number = 0;

  color_scale!: chroma.Scale;

  rect_size: number = 8.5;
  rect_spacing: number = 11.5;
  svg_width: number = 880;

  ngOnInit() {
    let stats: Statistics;
    [this.data, stats] = get_activity_data(this.duration, this.activity);
    this.total = stats.total;
    this.active = stats.active;
    this.streak = stats.streak;

    this.color_scale = chroma.scale(['ffffff14', this.color])
  }

  displayTooltip(year: number, month: string, day: number, x: number, y: number, num: number) {
    this.tooltip.nativeElement.querySelector('p').innerHTML = `${num} ${this.activity} on ${month} ${day}, ${year}`;
    this.tooltip.nativeElement.classList.remove('hidden');
    this.renderer.setStyle(this.tooltip.nativeElement, 'top', `${y - 34}px`);
    this.renderer.setStyle(this.tooltip.nativeElement, 'left', `${x - 90}px`);
  }

  hideTooltip() {
    this.tooltip.nativeElement.classList.add('hidden');
  }
}

type HistoryJSON = {
  [year: number]: {
    [month: string]: {
      [day: number]: number
    }
  }
}
type MonthActivity = {
  year: number;
  month: string;
  display_name: boolean;
  weeks: {
    offset: number,
    //    [weekday, day,   count ][]
    days: [number, number, number][]
  }[]
}
type Statistics = {
  total: number;
  active: number;
  streak: number;
}

function get_activity_data(duration: Duration, activity: string): [MonthActivity[], Statistics] {
  const raw_data: HistoryJSON = {
    2024: {
      "May": { 25: 3, 26: 5, 27: 4, 28: 1, 29: 3, 30: 10 }
    }
  };
  const filtered_data: MonthActivity[] = [];
  const stats: Statistics = {
    total: 0,
    active: 0,
    streak: 0
  }
  let curr_streak: number = 0;
  
  let now: DateTime = DateTime.local();
  let prev: DateTime;
  if (duration === Duration.one_year) prev = now.minus({year: 1});
  else if (duration === Duration.six_months) prev = now.minus({month: 6});
  else if (duration === Duration.three_months) prev = now.minus({month: 3});
  else prev = now.minus({month: 1});
  
  let offset: number = 0;
  for (prev; prev < now; prev = prev.plus({days: 1})) {
    let year: number = prev.year;
    let month: string = prev.toFormat("LLL");
    let day: number = prev.day;
    let day_of_week: number = (prev.weekday + 1) % 7;

    if (day === 1 && filtered_data.length != 0) offset += 15;
    else if (day_of_week === 0 && filtered_data.length !== 0) offset += 10;

    // let num: number = raw_data[year]?.[month]?.[day] ?? 0;
    let num: number = Math.floor(Math.random() * (5 + 1));

    if (day === 1 || filtered_data.length === 0) filtered_data.push({year: year, month: month, display_name: true, weeks: []});
    let m: number = filtered_data.length;

    if (day_of_week === 0 || filtered_data[m - 1].weeks.length === 0) filtered_data[m - 1].weeks.push({offset: offset, days: []});
    let w: number = filtered_data[m - 1].weeks.length;

    filtered_data[m - 1].weeks[w - 1].days.push([day_of_week, day, num]);
    stats.total += num;
    curr_streak = (num > 0) ? curr_streak + 1 : 0;
    stats.streak = Math.max(stats.streak, curr_streak);
    stats.active += Number(num > 0);
  }

  let m: number = filtered_data.length;
  let days_in_first_month: number = filtered_data[0].weeks.reduce((acc, curr) => acc + curr.days.length, 0);
  let days_in_last_month: number = filtered_data[m - 1].weeks.reduce((acc, curr) => acc + curr.days.length, 0);
  if (days_in_first_month < days_in_last_month) filtered_data[0].display_name = false;
  else filtered_data[m - 1].display_name = false;

  
  return [filtered_data, stats];
}