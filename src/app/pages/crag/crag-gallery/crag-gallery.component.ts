import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ImageFullComponent } from 'src/app/common/image-full/image-full.component';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { ResponsiveImageComponent } from 'src/app/shared/components/responsive-image/responsive-image.component';
import { Crag, Image } from 'src/generated/graphql';
import { ImageArrayTransformPipe } from './image-array-transform/image-array-transform.pipe';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-crag-gallery',
  templateUrl: './crag-gallery.component.html',
  styleUrls: ['./crag-gallery.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ResponsiveImageComponent,
    ImageArrayTransformPipe,
    RouterModule,
    MatIconModule,
    MatButtonModule,
  ],
})
export class CragGalleryComponent implements OnInit, OnChanges {
  @Input() images!: Image[];
  @Input() crag!: Crag;
  @Input() onlyPreview?: boolean = false;

  protected screenWidth: number;
  protected screenHeight: number;
  protected nrColumns: number = 2;
  constructor(
    private readonly dialog: MatDialog,
    private readonly breakpointService: BreakpointService
  ) {}

  ngOnInit() {
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
    this.calcNrColumns();
    this.breakpointService.observe().subscribe(() => {
      this.calcNrColumns();
    });
  }

  ngOnChanges() {
    this.calcNrColumns();
  }

  private calcNrColumns(): void {
    if (this.breakpointService.ltSm()) {
      this.nrColumns = 2;
    }
    if (this.breakpointService.gtSm()) {
      this.nrColumns = 3;
    }
    if (this.breakpointService.gtMd()) {
      this.nrColumns = 4;
    }
    if (this.breakpointService.gtXl()) {
      this.nrColumns = 5;
    }
  }

  get getColumnsArray(): string[] {
    return new Array(this.nrColumns);
  }

  onImageClick(index: number): void {
    this.dialog.open(ImageFullComponent, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      data: { images: this.images, currentImageIndex: index },
      autoFocus: false,
    });
  }
}
