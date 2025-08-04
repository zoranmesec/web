import { Component, Input, OnInit } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormControl,
} from '@angular/forms';
import { EditorComponent, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';
@Component({
    selector: 'app-my-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss'],
    imports: [FormsModule, ReactiveFormsModule, EditorComponent]
})
export class MyEditorComponent implements OnInit {
  @Input() placeholder: string;
  @Input() control: UntypedFormControl;
  @Input() label: string = '';

  focus: boolean = false;

  init: EditorComponent['init'] = {
    height: 250,
    menubar: false,
    entity_encoding: 'raw',
    setup: (editor) => {
      editor.on('focusin', () => {
        this.focus = true;
      });
      editor.on('focusout', () => {
        this.focus = false;
      });
      editor.on('init', () => {
        if (this.control.disabled) {
          this.control.disable();
        } else {
          this.control.enable();
        }
      });
    },
    plugins: ['autolink lists link'],
    toolbar:
      'undo redo | bold italic underline strikethrough | \
      bullist numlist | link',
    elementpath: false,
  };

  constructor() {}

  ngOnInit(): void {}
}
