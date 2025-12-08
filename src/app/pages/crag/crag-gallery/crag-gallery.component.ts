import { Component, input, OnChanges, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ImageFullComponent } from 'src/app/common/image-full/image-full.component';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { ResponsiveImageComponent } from 'src/app/shared/components/responsive-image/responsive-image.component';
import { IconsModule } from 'src/app/shared/icons/icons.module';
import { Image } from 'src/generated/graphql';
import { ImageArrayTransformPipe } from './image-array-transform/image-array-transform.pipe';

@Component({
    selector: 'app-crag-gallery',
    templateUrl: './crag-gallery.component.html',
    styleUrls: ['./crag-gallery.component.scss'],
    standalone: true,
    imports: [ResponsiveImageComponent, ImageArrayTransformPipe, RouterModule, MatIconModule, MatButtonModule, IconsModule]
})
export class CragGalleryComponent implements OnInit, OnChanges {
    images = input.required<Image[]>();
    onlyPreview = input<boolean>(false);

    protected screenWidth: number;
    protected screenHeight: number;
    protected nrColumns = 2;
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
        if (this.breakpointService.sgLtSm()) {
            this.nrColumns = 2;
        }
        if (this.breakpointService.sgGtSm()) {
            this.nrColumns = 3;
        }
        if (this.breakpointService.sgGtMd()) {
            this.nrColumns = 4;
        }
        if (this.breakpointService.sgGtXl()) {
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
            data: { images: this.images(), currentImageIndex: index },
            autoFocus: false
        });
    }
}
