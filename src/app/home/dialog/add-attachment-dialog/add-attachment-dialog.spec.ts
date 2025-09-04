import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAttachmentDialog } from './add-attachment-dialog';

describe('AddAttachmentDialog', () => {
  let component: AddAttachmentDialog;
  let fixture: ComponentFixture<AddAttachmentDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddAttachmentDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddAttachmentDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
