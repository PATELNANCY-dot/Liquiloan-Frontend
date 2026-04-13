import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth';
import { FaqService } from '../services/faq.service';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './faq.html',
  styleUrls: ['./faq.css']
})
export class Faq implements OnInit {

  faqs: any[] = [];
  filteredFaqs: any[] = [];

  categories: string[] = [];
  selectedCategory: string = 'all';

  searchText = '';
  showQuery = false;
  queryText = '';

  constructor(
    private authService: AuthService,
    private faqService: FaqService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.loadFaqs();
  }

  loadFaqs() {
    this.faqService.getFaqs().subscribe((res: any) => {

      const data = res?.$values || res;

      this.faqs = data.map((f: any) => ({
        ...f,
        open: false
      }));
 
      this.categories = ['All', ...new Set(this.faqs.map(f => f.category))];

      this.filteredFaqs = this.faqs;
      this.cdr.detectChanges(); 
    });
  }

  selectCategory(cat: string) {
    this.selectedCategory = cat;
    this.filter();
  }

  toggle(f: any) {
    f.open = !f.open;
  }

  filter() {
    const text = this.searchText.toLowerCase();

    this.filteredFaqs = this.faqs.filter(f => {

      const matchCategory =
        this.selectedCategory === 'All' ||
        f.category === this.selectedCategory;

      const matchSearch =
        f.question.toLowerCase().includes(text) ||
        f.answer.toLowerCase().includes(text);

      return matchCategory && matchSearch;
    });
  }


  submitQuery() {
    if (!this.queryText) {
      Swal.fire('Error', 'Enter query', 'error');
      return;
    }

    const clientId = this.authService.getUserId();

    if (!clientId) {
      Swal.fire('Error', 'User not logged in', 'error');
      return;
    }

    const payload = {
      clientId: Number(clientId),
      queryText: this.queryText   
    };

    console.log("Sending payload:", payload);

    this.faqService.raiseQuery(payload).subscribe({
      next: () => {
        this.showQuery = false;
        this.cdr.detectChanges(); 
      
        Swal.fire('Query Sent', 'Query submitted ', 'success');
        this.queryText = '';
      },
      error: (err) => {
        console.error("API ERROR:", err);

        Swal.fire('Error', 'Failed to submit query', 'error');
      }
    });
  }

}
