import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiRequestService } from "../services/api-request.service";
import { ApiUrlsService } from "../services/api-urls.service";
import { AuthService } from "../services/auth.service";
import { Router } from '@angular/router';
import { ProductDataListComponent } from '../product-data-list/product-data-list.component';
import { Unsubscribable } from '../shared/unsubscribable';
import { takeUntil } from 'rxjs';

interface Metric {
  name: string;
  data: number[];
}

interface Product {
  id: string;
  name: string;
  createdAt: number;
}

@Component({
  selector: 'app-piechartdashboard',
  standalone: true,
  imports: [CommonModule, HighchartsChartModule, FormsModule, ProductDataListComponent],
  templateUrl: './piechartdashboard.component.html',
  styleUrls: ['./piechartdashboard.component.css']
})
export class PiechartdashboardComponent extends Unsubscribable implements OnInit {
  Highcharts: typeof Highcharts = Highcharts;
  chartOptionsColumn: Highcharts.Options = {};
  drilldownChartOptions: Highcharts.Options = {};
  chartPixelWidth = 800;
  currentUser: any = {};

  selectedProductName = '';
  issuedPoints = 0;
  issuedValue = 0;

  selectedSortMetric: string = '';
  currentTab: string = 'dashboard';

  constructor(
    private apiRequestService: ApiRequestService,
    public apiUrls: ApiUrlsService,
    private AuthService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    super();
    this.currentUser = this.AuthService.currentUserValue;
  }

  ngOnInit(): void {
    this.loadMainChart(this.selectedSortMetric);
  }

   switchTab(tab: string) {
  this.currentTab = tab;
}

  loadMainChart(sortByMetricName: string): void {
    this.apiRequestService.getBatchStatistics().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const products: Product[] = res.products || [];
        const metrics: Metric[] = res.metrics || [];

        if (!products.length || !metrics.length) return;

        let sortedProducts: Product[] = [];
        let sortedIndexes: number[] = [];

        if (!sortByMetricName) {
          sortedProducts = [...products];
          sortedIndexes = products.map((_, index) => index);
        } else if (sortByMetricName === 'Created At') {
          const combined = products
            .map((p, index) => ({ product: p, index }))
            .sort((a, b) => b.product.createdAt - a.product.createdAt);

          sortedProducts = combined.map(c => c.product);
          sortedIndexes = combined.map(c => c.index);
        } else {
          const metricToSort = metrics.find(m => m.name === sortByMetricName);
          if (!metricToSort) {
            console.warn(`Metric ${sortByMetricName} not found.`);
            return;
          }

          const combined = products.map((product: Product, i: number) => ({
            product,
            metricValue: metricToSort.data[i],
            index: i
          }));

          combined.sort((a, b) => b.metricValue - a.metricValue);

          sortedProducts = combined.map(item => item.product);
          sortedIndexes = combined.map(item => item.index);
        }

        const categories = sortedProducts.map((p: Product) => p.name);
        const defaultColors = Highcharts.getOptions().colors || ['#7cb5ec', '#434348', '#90ed7d', '#f7a35c'];

        const seriesData = metrics.map((metric: Metric, index: number) => ({
          name: metric.name,
          type: 'column',
          data: sortedIndexes.map(idx => metric.data[idx]),
          color: defaultColors[index % defaultColors.length]
        }));

        const estimatedWidth = categories.length * 120;
        this.chartPixelWidth = Math.max(estimatedWidth, 800);

        this.chartOptionsColumn = {
          chart: {
            type: 'column',
            scrollablePlotArea: {
              minWidth: this.chartPixelWidth,
              scrollPositionX: 0
            }
          },
          title: { text: '' },
          xAxis: {
            categories,
            crosshair: true,
            scrollbar: { enabled: true },
          },
          yAxis: {
            min: 0,
            title: { text: 'Values' }
          },
          tooltip: { shared: true },
          legend: { enabled: false },
          plotOptions: {
            column: {
              cursor: 'pointer',
              point: {
                events: {
                  click: (event: any) =>
                    this.onProductClick(event.point.index, sortedProducts[event.point.index].id, sortedProducts[event.point.index].name)
                }
              },
              pointPadding: 0.25,
              groupPadding: 0.15,
              borderWidth: 0,
              pointWidth: 20
            }
          },
          series: seriesData as Highcharts.SeriesColumnOptions[]
        };

        this.selectedProductName = '';
        this.drilldownChartOptions = {};
        this.issuedPoints = 0;
        this.issuedValue = 0;

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('API Error:', err);
      }
    });
  }

  onProductClick(index: number, productId: string, productName: string): void {
    this.selectedProductName = productName;

    this.apiRequestService.getBatchTimeline(productId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const months: string[] = res.months || [];
        const metrics: Metric[] = res.metrics || [];

        this.issuedPoints = res.issuedPoints || 0;
        this.issuedValue = res.issuedValue || 0;

        const formattedMonths = months.map((monthStr: string) => {
          const [year, month] = monthStr.split("-");
          const date = new Date(+year, +month - 1);
          return date.toLocaleString('default', { month: 'long', year: 'numeric' });
        });

        const drilldownColors = ['#00e272', '#fe6a35'];

        const seriesData = metrics.map((metric: Metric, idx: number) => ({
          name: metric.name,
          type: 'column',
          data: metric.data,
          color: drilldownColors[idx] || '#000000'
        }));

        this.drilldownChartOptions = {
          chart: { type: 'column' },
          title: { text: '' },
          xAxis: { categories: formattedMonths, crosshair: true },
          yAxis: { min: 0, title: { text: 'Values' } },
          tooltip: { shared: true },
          legend: { enabled: false },
          plotOptions: {
            column: {
              pointPadding: 0.2,
              borderWidth: 0,
              pointWidth: 20
            }
          },
          series: seriesData as Highcharts.SeriesColumnOptions[]
        };

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Drilldown API error:', err);
      }
    });
  }

  getSeriesColor(series: Highcharts.SeriesOptionsType | Highcharts.UnknownSeriesOptions): string {
    const color = (series as Highcharts.SeriesColumnOptions).color;
    return typeof color === 'string' ? color : '#000000';
  }

  onSortMetricChange(): void {
    this.loadMainChart(this.selectedSortMetric);
  }
}
