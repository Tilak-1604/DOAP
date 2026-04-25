package com.DOAP.service;

import com.DOAP.entity.Booking;
import com.DOAP.entity.User;
import com.DOAP.entity.Screen;
import com.DOAP.repository.ScreenRepository;
import com.DOAP.repository.UserRepository;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final UserRepository userRepository;
    private final ScreenRepository screenRepository;

    public byte[] generateInvoice(Booking booking) throws DocumentException {
        User advertiser = userRepository.findById(booking.getAdvertiserId())
                .orElseThrow(() -> new RuntimeException("Advertiser not found"));
        Screen screen = screenRepository.findById(booking.getScreenId())
                .orElseThrow(() -> new RuntimeException("Screen not found"));

        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        PdfWriter.getInstance(document, out);
        document.open();

        // 1. Header
        addHeader(document);

        // 2. Invoice Details
        addInvoiceDetails(document, booking);

        // 3. Customer Section
        addCustomerSection(document, advertiser);

        // 4. Booking Table
        addBookingTable(document, booking, screen);

        // 5. Footer
        addFooter(document);

        document.close();
        return out.toByteArray();
    }

    private void addHeader(Document document) throws DocumentException {
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, BaseColor.BLACK);
        Paragraph title = new Paragraph("DOAP - Digital Outdoor Advertising Platform", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        document.add(Chunk.NEWLINE);
    }

    private void addInvoiceDetails(Document document, Booking booking) throws DocumentException {
        Font font = FontFactory.getFont(FontFactory.HELVETICA, 12, BaseColor.BLACK);
        document.add(new Paragraph("Invoice Number: INV-" + booking.getId(), font));
        document.add(new Paragraph("Date: " + java.time.LocalDate.now(), font));
        document.add(Chunk.NEWLINE);
    }

    private void addCustomerSection(Document document, User advertiser) throws DocumentException {
        Font font = FontFactory.getFont(FontFactory.HELVETICA, 12, BaseColor.BLACK);
        document.add(new Paragraph("Bill To:", FontFactory.getFont(FontFactory.HELVETICA_BOLD)));
        document.add(new Paragraph("Name: " + advertiser.getName(), font));
        document.add(new Paragraph("Email: " + advertiser.getEmail(), font));
        document.add(Chunk.NEWLINE);
    }

    private void addBookingTable(Document document, Booking booking, Screen screen) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);

        addTableHeader(table, "Description");
        addTableHeader(table, "Details");

        addRow(table, "Screen Name", screen.getScreenName());
        addRow(table, "Location", screen.getLocation() != null ? screen.getLocation() : screen.getAddress());

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        addRow(table, "Start Time", booking.getStartDatetime().format(formatter));
        addRow(table, "End Time", booking.getEndDatetime().format(formatter));
        addRow(table, "Total Amount Paid", "INR " + String.format("%.2f", booking.getPriceAmount()));

        // Platform fee logic can be added here if needed separate from total

        document.add(table);
        document.add(Chunk.NEWLINE);
    }

    private void addTableHeader(PdfPTable table, String headerTitle) {
        PdfPCell header = new PdfPCell();
        header.setBackgroundColor(BaseColor.LIGHT_GRAY);
        header.setBorderWidth(1);
        header.setPhrase(new Phrase(headerTitle));
        table.addCell(header);
    }

    private void addRow(PdfPTable table, String key, String value) {
        table.addCell(key);
        table.addCell(value);
    }

    private void addFooter(Document document) throws DocumentException {
        Paragraph footer = new Paragraph("Thank you for using DOAP. \nContact: support@doap.com",
                FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10, BaseColor.GRAY));
        footer.setAlignment(Element.ALIGN_CENTER);
        document.add(footer);
    }
}
