import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowAttachmentDialog } from './show-attachment-dialog';

describe('ShowAttachmentDialog', () => {
  let component: ShowAttachmentDialog;
  let fixture: ComponentFixture<ShowAttachmentDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowAttachmentDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowAttachmentDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
