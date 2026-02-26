<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xpath-default-namespace="urn:hl7-org:v3/mif2">
	<xsl:output method="xml" version="1.0" encoding="UTF-8" indent="yes"/>
	<xsl:template match="@*|node()">
    <xsl:apply-templates select="@*|node()"/>
	</xsl:template>
	<xsl:template match="concept">
    <xsl:if test="not(conceptProperty[@name='internalId'])">
      <xsl:message terminate="yes" select="concat('Unable to find ''internalId'' property on code ', code[1]/@code, ' in code system ', ancestor::codeSystem/@name)"/>
    </xsl:if>
	</xsl:template>
</xsl:stylesheet>
