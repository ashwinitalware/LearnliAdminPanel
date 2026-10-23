import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../../shared/shared.module'; // adjust path as per your project

interface CommunityPost {
  id: number;
  userName: string;
  userInitials: string;
  avatarColor: string;
  category: string;
  title: string;
  description: string;
  postedDate: string;
  likes: number;
  comments: number;
  status: string;
}

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule],
  templateUrl: './community.html',
  styleUrl: './community.scss'
})
export class Community {

  searchTerm: string = '';
  selectedCategory: string = 'All';

  categories: string[] = ['All', 'Mathematics', 'Physics', 'Chemistry'];

  selectedPost: CommunityPost | null = null;
  modalRef!: NgbModalRef;

  posts: CommunityPost[] = [
    {
      id: 1,
      userName: 'Aarav Mehta',
      userInitials: 'AM',
      avatarColor: 'primary',
      category: 'Mathematics',
      title: 'Struggling with Integration by Parts formulas. Any short tricks?',
      description: 'I am preparing for the upcoming term exams and keep mixing up the LIATE rule terms. Does anyone have a mnemonic or easy flow chart to remember which function should be u and which should be v?',
      postedDate: '2 hours ago',
      likes: 18,
      comments: 2,
      status: 'Active'
    },
    {
      id: 2,
      userName: 'Sneha Rao',
      userInitials: 'SR',
      avatarColor: 'danger',
      category: 'Physics',
      title: 'Difference between transverse and longitudinal wave behavior?',
      description: 'Could someone explain in simple terms with real-world examples? I understand sound waves are longitudinal, but what is the visual physics behind it?',
      postedDate: '5 hours ago',
      likes: 24,
      comments: 5,
      status: 'Active'
    }
  ];

  get filteredPosts(): CommunityPost[] {
    return this.posts.filter(post => {
      const matchesCategory = this.selectedCategory === 'All' || post.category === this.selectedCategory;
      const matchesSearch = post.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                             post.userName.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }

  filterByCategory(category: string) {
    this.selectedCategory = category;
  }

  getCategoryBadgeClass(category: string): string {
    switch (category) {
      case 'Mathematics': return 'bg-primary-transparent';
      case 'Physics': return 'bg-secondary-transparent';
      case 'Chemistry': return 'bg-success-transparent';
      default: return 'bg-info-transparent';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Active': return 'bg-success-transparent';
      case 'Blocked': return 'bg-danger-transparent';
      case 'Pending': return 'bg-warning-transparent';
      default: return 'bg-info-transparent';
    }
  }

  openViewModal(content: any, post: CommunityPost) {
    this.selectedPost = post;
    this.modalRef = this.modalService.open(content, { size: 'lg', centered: true });
  }

  openEditModal(content: any, post: CommunityPost) {
    this.selectedPost = { ...post };
    this.modalRef = this.modalService.open(content, { size: 'lg', centered: true });
  }

  openDeleteModal(content: any, post: CommunityPost) {
    this.selectedPost = post;
    this.modalRef = this.modalService.open(content, { size: 'md', centered: true });
  }

  saveEdit() {
    if (this.selectedPost) {
      const index = this.posts.findIndex(p => p.id === this.selectedPost!.id);
      if (index !== -1) {
        this.posts[index] = { ...this.selectedPost };
      }
    }
    this.modalRef.close();
  }

  confirmDelete() {
    if (this.selectedPost) {
      this.posts = this.posts.filter(p => p.id !== this.selectedPost!.id);
    }
    this.modalRef.close();
  }

  constructor(private modalService: NgbModal) {}
}